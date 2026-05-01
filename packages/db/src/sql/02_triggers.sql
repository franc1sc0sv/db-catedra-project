-- ============================================================
-- TRIGGERS
-- ============================================================

-- Trigger 1: Auto-create MedicalRecord when a new Patient is inserted
CREATE OR REPLACE FUNCTION fn_create_medical_record_on_patient()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO "MedicalRecords" (id, "patientDui", "bloodType", "openedAt")
  VALUES (gen_random_uuid(), NEW.dui, 'O+', CURRENT_DATE);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_create_medical_record ON "Patients";
CREATE TRIGGER trg_create_medical_record
  AFTER INSERT ON "Patients"
  FOR EACH ROW
  EXECUTE FUNCTION fn_create_medical_record_on_patient();


-- Trigger 2: Auto-insert WhatsApp confirmation message when appointment is booked
CREATE OR REPLACE FUNCTION fn_send_whatsapp_on_appointment()
RETURNS TRIGGER AS $$
DECLARE
  v_phone VARCHAR;
  v_date  DATE;
  v_time  TIME;
BEGIN
  SELECT p."whatsappPhone", se."eventDate", se."startTime"
  INTO   v_phone, v_date, v_time
  FROM   "Patients"       p
  JOIN   "ScheduleEvents" se ON se.id = NEW."eventId"
  WHERE  p.dui = NEW."patientDui";

  INSERT INTO "WhatsAppMessages" (
    id, "appointmentId", "destinationPhone",
    "messageType", "messageBody", "sentAt", "deliveryStatus"
  )
  VALUES (
    gen_random_uuid(),
    NEW.id,
    v_phone,
    'confirmation',
    'Your appointment has been confirmed for ' || v_date || ' at ' || v_time || '. Reason: ' || NEW."bookingReason",
    NOW(),
    'sent'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_whatsapp_on_appointment ON "MedicalAppointments";
CREATE TRIGGER trg_whatsapp_on_appointment
  AFTER INSERT ON "MedicalAppointments"
  FOR EACH ROW
  EXECUTE FUNCTION fn_send_whatsapp_on_appointment();


-- Trigger 3: Block schedule event when appointment is booked
CREATE OR REPLACE FUNCTION fn_block_event_on_appointment()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE "ScheduleEvents"
  SET "availabilityStatus" = 'busy'
  WHERE id = NEW."eventId";
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_block_event_on_appointment ON "MedicalAppointments";
CREATE TRIGGER trg_block_event_on_appointment
  AFTER INSERT ON "MedicalAppointments"
  FOR EACH ROW
  EXECUTE FUNCTION fn_block_event_on_appointment();
