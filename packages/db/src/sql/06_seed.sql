-- ============================================================
-- SEED DATA — base reference rows
-- Users and all user-dependent rows (Patients, ScheduleEvents,
-- MedicalAppointments, ClinicalConsultations) are seeded from
-- packages/db/src/seed-auth.ts, which signs users up through
-- Better Auth so Accounts rows get real scrypt-hashed passwords.
-- Default password for all seeded users: "password123"
-- ============================================================

-- MedicalInsurances (5 rows)
INSERT INTO "MedicalInsurances" (id, "insurerName", "coverageType") VALUES
  ('a1000000-0000-0000-0000-000000000001', 'SISA',         'comprehensive'),
  ('a1000000-0000-0000-0000-000000000002', 'ASESUISA',     'complete'),
  ('a1000000-0000-0000-0000-000000000003', 'Pan American', 'basic'),
  ('a1000000-0000-0000-0000-000000000004', 'ACSA',         'dental'),
  ('a1000000-0000-0000-0000-000000000005', 'La Central',   'vision');
