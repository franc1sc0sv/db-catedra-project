-- ============================================================
-- SUBQUERIES
-- ============================================================

-- Subquery 1: Patients with more than 2 consultations this month
SELECT
  p.dui,
  p."firstName",
  p."lastName",
  visit_count."total"
FROM "Patients" p
JOIN (
  SELECT mr."patientDui", COUNT(*) AS total
  FROM   "ClinicalConsultations" cc
  JOIN   "MedicalRecords"        mr ON mr.id = cc."recordId"
  JOIN   "MedicalAppointments"   ma ON ma.id = cc."appointmentId"
  WHERE  ma."bookedAt" >= DATE_TRUNC('month', NOW())
  GROUP  BY mr."patientDui"
  HAVING COUNT(*) > 2
) AS visit_count ON visit_count."patientDui" = p.dui
ORDER BY visit_count.total DESC;


-- Subquery 2: Available schedule slots with no appointment booked
SELECT
  se.id,
  se."eventDate",
  se."startTime",
  se."endTime"
FROM "ScheduleEvents" se
WHERE
  se."eventType"          = 'appointment'
  AND se."availabilityStatus" = 'available'
  AND se.id NOT IN (
    SELECT "eventId" FROM "MedicalAppointments"
  )
  AND se."eventDate" >= CURRENT_DATE
ORDER BY se."eventDate", se."startTime";


-- Subquery 3: Patients who have never had a consultation
SELECT
  p.dui,
  p."firstName",
  p."lastName",
  p."birthDate"
FROM "Patients" p
WHERE p.dui NOT IN (
  SELECT mr."patientDui"
  FROM   "MedicalRecords"        mr
  JOIN   "ClinicalConsultations" cc ON cc."recordId" = mr.id
);


-- Subquery 4: WhatsApp messages with failed delivery per appointment
SELECT
  ma.id  AS "appointmentId",
  p."firstName",
  p."lastName",
  failed."failedCount"
FROM "MedicalAppointments" ma
JOIN "Patients" p ON p.dui = ma."patientDui"
JOIN (
  SELECT "appointmentId", COUNT(*) AS "failedCount"
  FROM   "WhatsAppMessages"
  WHERE  "deliveryStatus" = 'failed'
  GROUP  BY "appointmentId"
) AS failed ON failed."appointmentId" = ma.id
ORDER BY failed."failedCount" DESC;
