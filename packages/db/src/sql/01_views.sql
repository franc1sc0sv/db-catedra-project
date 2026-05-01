-- ============================================================
-- VIEWS
-- ============================================================

-- View 1: Daily schedule — joins events, appointments and patients
-- Used by receptionist to see the full day agenda
CREATE OR REPLACE VIEW "DailyScheduleView" AS
SELECT
  se.id                 AS "eventId",
  se."doctorId",
  se."eventDate",
  se."startTime",
  se."endTime",
  se."availabilityStatus",
  ma.id                 AS "appointmentId",
  ma."bookingReason",
  p.dui                 AS "patientDui",
  p."firstName",
  p."lastName",
  p."whatsappPhone"
FROM "ScheduleEvents" se
LEFT JOIN "MedicalAppointments" ma ON ma."eventId" = se.id
LEFT JOIN "Patients" p             ON p.dui = ma."patientDui"
WHERE se."eventType" = 'appointment';


-- View 2: Full patient record — patient + medical record + latest consultation
-- Used by doctor during consultation
CREATE OR REPLACE VIEW "PatientFullRecordView" AS
SELECT
  p.dui,
  p."firstName",
  p."lastName",
  p."birthDate",
  p."whatsappPhone",
  mi."insurerName",
  mi."coverageType",
  mr.id                 AS "recordId",
  mr."bloodType",
  mr."knownAllergies",
  mr."familyHistory",
  mr."chronicConditions",
  mr."openedAt"         AS "recordOpenedAt",
  cc.id                 AS "lastConsultationId",
  cc."mainDiagnosis"    AS "lastDiagnosis",
  cc."prescribedTreatment" AS "lastTreatment",
  ma."bookedAt"         AS "lastVisitDate"
FROM "Patients" p
LEFT JOIN "MedicalInsurances"    mi ON mi.id      = p."insuranceId"
LEFT JOIN "MedicalRecords"       mr ON mr."patientDui" = p.dui
LEFT JOIN LATERAL (
  SELECT cc.*, ma."bookedAt"
  FROM "ClinicalConsultations" cc
  JOIN "MedicalAppointments"   ma ON ma.id = cc."appointmentId"
  WHERE cc."recordId" = mr.id
  ORDER BY ma."bookedAt" DESC
  LIMIT 1
) cc ON true
LEFT JOIN "MedicalAppointments" ma ON ma.id = cc."appointmentId";
