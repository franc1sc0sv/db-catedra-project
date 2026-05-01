-- ============================================================
-- ROLES & PRIVILEGES
-- ============================================================

-- Create roles
CREATE ROLE role_doctor      LOGIN PASSWORD 'Doctor@2026!';
CREATE ROLE role_receptionist LOGIN PASSWORD 'Recept@2026!';
CREATE ROLE role_patient     LOGIN PASSWORD 'Patient@2026!';

-- ---- DOCTOR: full clinical access + user management (replaces admin) ----
GRANT SELECT, INSERT, UPDATE ON
  "Users"
TO role_doctor;

GRANT SELECT ON
  "Patients", "MedicalInsurances",
  "MedicalRecords", "ScheduleEvents", "MedicalAppointments",
  "WhatsAppMessages"
TO role_doctor;

GRANT SELECT, INSERT, UPDATE ON
  "ClinicalConsultations"
TO role_doctor;

GRANT SELECT ON
  "DailyScheduleView", "PatientFullRecordView"
TO role_doctor;

-- ---- RECEPTIONIST: manage schedule and appointments ----
GRANT SELECT ON
  "Users", "Patients", "MedicalInsurances", "ScheduleEvents",
  "MedicalAppointments", "WhatsAppMessages"
TO role_receptionist;

GRANT INSERT, UPDATE, DELETE ON
  "ScheduleEvents", "MedicalAppointments"
TO role_receptionist;

GRANT INSERT ON
  "WhatsAppMessages"
TO role_receptionist;

GRANT SELECT ON
  "DailyScheduleView"
TO role_receptionist;

-- ---- PATIENT: read only their own appointments ----
-- (row-level security should be added in production)
GRANT SELECT ON
  "MedicalAppointments", "ScheduleEvents"
TO role_patient;
