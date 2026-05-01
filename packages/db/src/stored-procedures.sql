-- =============================================================================
-- Stored Procedures — Sistema de Citas Medicas
-- Spec: agent-os/specs/capa-datos/procedimientos-almacenados
--
-- Convenciones:
--   * Las identificadores de tablas/columnas son case-sensitive (PascalCase
--     y camelCase) por lo que SIEMPRE se citan con comillas dobles.
--   * Los SP de solo lectura se exponen como FUNCTIONS RETURNS TABLE para
--     poder consumirlos via `SELECT * FROM fn(...)` desde Drizzle.
--   * Los SP de escritura usan PROCEDURE + bloque BEGIN/EXCEPTION/END para
--     atomicidad. `RAISE EXCEPTION` propaga errores de negocio a Drizzle/JS.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- sp_get_available_slots(p_date)
--
-- Devuelve los ScheduleEvents disponibles (availabilityStatus = 'available'
-- y eventType = 'appointment') para una fecha dada, ordenados por hora de
-- inicio. Read-only: implementado como funcion RETURNS TABLE.
--
-- Uso:
--   SELECT * FROM sp_get_available_slots('2026-04-28');
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION sp_get_available_slots(p_date DATE)
RETURNS TABLE (
  id          UUID,
  "eventDate" DATE,
  "startTime" TIME,
  "endTime"   TIME
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
    SELECT
      se.id,
      se."eventDate",
      se."startTime",
      se."endTime"
    FROM "ScheduleEvents" se
    WHERE se."eventDate"          = p_date
      AND se."eventType"          = 'appointment'
      AND se."availabilityStatus" = 'available'
    ORDER BY se."startTime" ASC;
END;
$$;


-- -----------------------------------------------------------------------------
-- sp_cancel_appointment(p_appointment_id, p_cancelled_by)
--
-- Cancela una cita medica de forma transaccional. Pasos:
--   1. Resuelve el ScheduleEvent vinculado al appointment.
--   2. Verifica que el evento NO este en estado 'completed'. Si lo esta,
--      lanza una excepcion y revierte todo.
--   3. Marca el ScheduleEvent como 'cancelled' y registra auditUserId.
--   4. Inserta un WhatsAppMessage de tipo 'cancellation' al telefono del
--      paciente.
--
-- Cualquier fallo dentro del bloque BEGIN/EXCEPTION/END produce rollback
-- atomico y re-emite el error original al cliente.
--
-- Uso:
--   CALL sp_cancel_appointment('<uuid-cita>', '<uuid-usuario>');
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_cancel_appointment(
  p_appointment_id UUID,
  p_cancelled_by   UUID
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_event_id           UUID;
  v_current_status     "availability_status";
  v_destination_phone  VARCHAR(20);
  v_first_name         VARCHAR(100);
BEGIN
  -- Resolver el evento y datos del paciente asociados a la cita.
  SELECT ma."eventId", se."availabilityStatus", p."whatsappPhone", p."firstName"
    INTO v_event_id, v_current_status, v_destination_phone, v_first_name
  FROM "MedicalAppointments" ma
  JOIN "ScheduleEvents" se ON se.id  = ma."eventId"
  JOIN "Patients"       p  ON p.dui = ma."patientDui"
  WHERE ma.id = p_appointment_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cita no encontrada: %', p_appointment_id
      USING ERRCODE = 'P0002';
  END IF;

  -- Regla de negocio: no se puede cancelar una cita ya completada.
  IF v_current_status = 'completed' THEN
    RAISE EXCEPTION 'La cita ya fue completada y no puede cancelarse'
      USING ERRCODE = 'P0001';
  END IF;

  -- Marcar evento como cancelado + auditoria.
  UPDATE "ScheduleEvents"
    SET "availabilityStatus" = 'cancelled',
        "auditUserId"        = p_cancelled_by
  WHERE id = v_event_id;

  -- Registrar el mensaje de cancelacion (auditoria de comunicacion).
  INSERT INTO "WhatsAppMessages" (
    "appointmentId",
    "destinationPhone",
    "messageType",
    "messageBody",
    "deliveryStatus"
  ) VALUES (
    p_appointment_id,
    v_destination_phone,
    'cancellation',
    'Hola ' || v_first_name || ', tu cita ha sido cancelada.',
    'sent'
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Re-emite el error: PostgreSQL revierte el bloque automaticamente y
    -- Drizzle propaga la excepcion como error de JS para que el repositorio
    -- la convierta en AppError.
    RAISE;
END;
$$;


-- -----------------------------------------------------------------------------
-- sp_complete_consultation(p_appointment_id, p_symptoms, p_bp, p_weight,
--                          p_diagnosis, p_treatment, p_notes)
--
-- Cierra una consulta medica de forma atomica. Pasos:
--   1. Resuelve la cadena MedicalAppointments -> Patients -> MedicalRecords
--      para obtener el recordId.
--   2. Inserta el registro clinico en ClinicalConsultations.
--   3. Marca el ScheduleEvent vinculado como 'completed'.
--
-- Si cualquier paso falla, el bloque BEGIN/EXCEPTION/END deshace todo.
--
-- Uso:
--   CALL sp_complete_consultation('<uuid>', 'sintomas', '120/80', 70.5,
--                                 'diagnostico', 'tratamiento', 'notas');
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_complete_consultation(
  p_appointment_id UUID,
  p_symptoms       TEXT,
  p_bp             VARCHAR,
  p_weight         NUMERIC,
  p_diagnosis      TEXT,
  p_treatment      TEXT,
  p_notes          TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_event_id  UUID;
  v_record_id UUID;
BEGIN
  -- Resolver eventId y recordId via la cadena
  -- MedicalAppointments -> Patients -> MedicalRecords.
  SELECT ma."eventId", mr.id
    INTO v_event_id, v_record_id
  FROM "MedicalAppointments" ma
  JOIN "Patients"       p  ON p.dui          = ma."patientDui"
  JOIN "MedicalRecords" mr ON mr."patientDui" = p.dui
  WHERE ma.id = p_appointment_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cita o expediente medico no encontrado para appointmentId: %',
                    p_appointment_id
      USING ERRCODE = 'P0002';
  END IF;

  -- Insertar el registro clinico de la consulta.
  INSERT INTO "ClinicalConsultations" (
    "recordId",
    "appointmentId",
    "presentedSymptoms",
    "bloodPressure",
    "weightKg",
    "mainDiagnosis",
    "prescribedTreatment",
    "doctorPrivateNotes"
  ) VALUES (
    v_record_id,
    p_appointment_id,
    p_symptoms,
    p_bp,
    p_weight,
    p_diagnosis,
    p_treatment,
    p_notes
  );

  -- Cerrar el slot del schedule.
  UPDATE "ScheduleEvents"
    SET "availabilityStatus" = 'completed'
  WHERE id = v_event_id;

EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;


-- -----------------------------------------------------------------------------
-- sp_get_patient_history(p_dui)
--
-- Combina los datos de PatientFullRecordView (datos demograficos +
-- expediente clinico) con TODAS las ClinicalConsultations del paciente,
-- ordenadas por fecha de consulta descendente (mas recientes primero).
--
-- Read-only: implementado como funcion RETURNS TABLE para consumir via
-- `SELECT * FROM sp_get_patient_history(...)`.
--
-- Uso:
--   SELECT * FROM sp_get_patient_history('01234567-8');
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION sp_get_patient_history(p_dui VARCHAR)
RETURNS TABLE (
  -- Datos del paciente (vienen de PatientFullRecordView).
  "dui"                 VARCHAR(10),
  "firstName"           VARCHAR(100),
  "lastName"            VARCHAR(100),
  "birthDate"           DATE,
  "whatsappPhone"       VARCHAR(20),
  "insurerName"         VARCHAR(200),
  "coverageType"        VARCHAR(50),
  "recordId"            UUID,
  "bloodType"           VARCHAR(5),
  "knownAllergies"      TEXT,
  "familyHistory"       TEXT,
  "chronicConditions"   TEXT,
  "recordOpenedAt"      DATE,
  -- Datos por consulta (una fila por ClinicalConsultation).
  "consultationId"      UUID,
  "consultationDate"    TIMESTAMP,
  "appointmentId"       UUID,
  "presentedSymptoms"   TEXT,
  "bloodPressure"       VARCHAR(20),
  "weightKg"            NUMERIC(5, 2),
  "mainDiagnosis"       TEXT,
  "prescribedTreatment" TEXT,
  "doctorPrivateNotes"  TEXT
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
    SELECT
      pfv."dui",
      pfv."firstName",
      pfv."lastName",
      pfv."birthDate",
      pfv."whatsappPhone",
      pfv."insurerName",
      pfv."coverageType",
      pfv."recordId",
      pfv."bloodType",
      pfv."knownAllergies",
      pfv."familyHistory",
      pfv."chronicConditions",
      pfv."recordOpenedAt",
      cc.id              AS "consultationId",
      ma."bookedAt"      AS "consultationDate",
      cc."appointmentId",
      cc."presentedSymptoms",
      cc."bloodPressure",
      cc."weightKg",
      cc."mainDiagnosis",
      cc."prescribedTreatment",
      cc."doctorPrivateNotes"
    FROM "PatientFullRecordView" pfv
    LEFT JOIN "ClinicalConsultations" cc ON cc."recordId"      = pfv."recordId"
    LEFT JOIN "MedicalAppointments"   ma ON ma.id              = cc."appointmentId"
    WHERE pfv."dui" = p_dui
    ORDER BY ma."bookedAt" DESC NULLS LAST;
END;
$$;
