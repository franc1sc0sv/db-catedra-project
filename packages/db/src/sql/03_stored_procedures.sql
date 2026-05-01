-- ============================================================
-- STORED PROCEDURES
-- ============================================================

-- Procedure 1: Book an appointment atomically
-- Creates schedule event + appointment in one transaction
CREATE OR REPLACE PROCEDURE sp_book_appointment(
  p_patient_dui    VARCHAR,
  p_event_date     DATE,
  p_start_time     TIME,
  p_end_time       TIME,
  p_booking_reason VARCHAR,
  p_audit_user_id  UUID
)
LANGUAGE plpgsql AS $$
DECLARE
  v_event_id       UUID;
  v_appointment_id UUID;
BEGIN
  -- Create schedule event
  INSERT INTO "ScheduleEvents" (
    id, "eventDate", "startTime", "endTime",
    "eventType", "availabilityStatus", "syncStatus", "auditUserId"
  )
  VALUES (
    gen_random_uuid(), p_event_date, p_start_time, p_end_time,
    'appointment', 'available', 'pending', p_audit_user_id
  )
  RETURNING id INTO v_event_id;

  -- Create appointment (triggers will handle WhatsApp + blocking event)
  INSERT INTO "MedicalAppointments" (
    id, "eventId", "patientDui", "bookingReason", "bookedAt"
  )
  VALUES (
    gen_random_uuid(), v_event_id, p_patient_dui, p_booking_reason, NOW()
  )
  RETURNING id INTO v_appointment_id;

  RAISE NOTICE 'Appointment % booked for patient % on % at %',
    v_appointment_id, p_patient_dui, p_event_date, p_start_time;
END;
$$;


-- Procedure 2: Register a clinical consultation
-- Inserts consultation linked to appointment + medical record
CREATE OR REPLACE PROCEDURE sp_register_consultation(
  p_appointment_id       UUID,
  p_symptoms             TEXT,
  p_blood_pressure       VARCHAR,
  p_weight_kg            NUMERIC,
  p_diagnosis            TEXT,
  p_treatment            TEXT,
  p_private_notes        TEXT DEFAULT NULL
)
LANGUAGE plpgsql AS $$
DECLARE
  v_record_id UUID;
  v_patient_dui VARCHAR;
BEGIN
  -- Resolve medical record from appointment
  SELECT mr.id, ma."patientDui"
  INTO   v_record_id, v_patient_dui
  FROM   "MedicalAppointments" ma
  JOIN   "MedicalRecords"      mr ON mr."patientDui" = ma."patientDui"
  WHERE  ma.id = p_appointment_id;

  IF v_record_id IS NULL THEN
    RAISE EXCEPTION 'No medical record found for appointment %', p_appointment_id;
  END IF;

  INSERT INTO "ClinicalConsultations" (
    id, "recordId", "appointmentId",
    "presentedSymptoms", "bloodPressure", "weightKg",
    "mainDiagnosis", "prescribedTreatment", "doctorPrivateNotes"
  )
  VALUES (
    gen_random_uuid(), v_record_id, p_appointment_id,
    p_symptoms, p_blood_pressure, p_weight_kg,
    p_diagnosis, p_treatment, p_private_notes
  );

  RAISE NOTICE 'Consultation registered for patient %', v_patient_dui;
END;
$$;


-- Procedure 3: Cancel appointment + send WhatsApp cancellation
CREATE OR REPLACE PROCEDURE sp_cancel_appointment(
  p_appointment_id UUID
)
LANGUAGE plpgsql AS $$
DECLARE
  v_event_id UUID;
  v_phone    VARCHAR;
BEGIN
  SELECT ma."eventId", p."whatsappPhone"
  INTO   v_event_id, v_phone
  FROM   "MedicalAppointments" ma
  JOIN   "Patients" p ON p.dui = ma."patientDui"
  WHERE  ma.id = p_appointment_id;

  IF v_event_id IS NULL THEN
    RAISE EXCEPTION 'Appointment % not found', p_appointment_id;
  END IF;

  -- Free the schedule slot
  UPDATE "ScheduleEvents"
  SET "availabilityStatus" = 'available'
  WHERE id = v_event_id;

  -- Send cancellation WhatsApp
  INSERT INTO "WhatsAppMessages" (
    id, "appointmentId", "destinationPhone",
    "messageType", "messageBody", "sentAt", "deliveryStatus"
  )
  VALUES (
    gen_random_uuid(), p_appointment_id, v_phone,
    'cancellation', 'Your appointment has been cancelled. Please contact us to reschedule.',
    NOW(), 'sent'
  );

  -- Remove appointment
  DELETE FROM "MedicalAppointments" WHERE id = p_appointment_id;

  RAISE NOTICE 'Appointment % cancelled, WhatsApp sent to %', p_appointment_id, v_phone;
END;
$$;
