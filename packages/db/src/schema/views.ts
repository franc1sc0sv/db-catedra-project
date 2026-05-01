import { pgView, uuid, date, time, varchar, text, timestamp } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const DailyScheduleView = pgView('DailyScheduleView', {
  eventId:            uuid('eventId'),
  doctorId:           uuid('doctorId'),
  eventDate:          date('eventDate'),
  startTime:          time('startTime'),
  endTime:            time('endTime'),
  availabilityStatus: varchar('availabilityStatus', { length: 50 }),
  appointmentId:      uuid('appointmentId'),
  bookingReason:      varchar('bookingReason', { length: 500 }),
  patientDui:         varchar('patientDui', { length: 10 }),
  firstName:          varchar('firstName', { length: 100 }),
  lastName:           varchar('lastName', { length: 100 }),
  whatsappPhone:      varchar('whatsappPhone', { length: 20 }),
}).as(sql`
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
  WHERE se."eventType" = 'appointment'
`)

export const PatientFullRecordView = pgView('PatientFullRecordView', {
  dui:                varchar('dui', { length: 10 }),
  firstName:          varchar('firstName', { length: 100 }),
  lastName:           varchar('lastName', { length: 100 }),
  birthDate:          date('birthDate'),
  whatsappPhone:      varchar('whatsappPhone', { length: 20 }),
  insurerName:        varchar('insurerName', { length: 200 }),
  coverageType:       varchar('coverageType', { length: 50 }),
  recordId:           uuid('recordId'),
  bloodType:          varchar('bloodType', { length: 5 }),
  knownAllergies:     text('knownAllergies'),
  familyHistory:      text('familyHistory'),
  chronicConditions:  text('chronicConditions'),
  recordOpenedAt:     date('recordOpenedAt'),
  lastConsultationId: uuid('lastConsultationId'),
  lastDiagnosis:      text('lastDiagnosis'),
  lastTreatment:      text('lastTreatment'),
  lastVisitDate:      timestamp('lastVisitDate'),
}).as(sql`
  SELECT
    p.dui,
    p."firstName",
    p."lastName",
    p."birthDate",
    p."whatsappPhone",
    mi."insurerName",
    mi."coverageType",
    mr.id                      AS "recordId",
    mr."bloodType",
    mr."knownAllergies",
    mr."familyHistory",
    mr."chronicConditions",
    mr."openedAt"              AS "recordOpenedAt",
    cc.id                      AS "lastConsultationId",
    cc."mainDiagnosis"         AS "lastDiagnosis",
    cc."prescribedTreatment"   AS "lastTreatment",
    ma."bookedAt"              AS "lastVisitDate"
  FROM "Patients" p
  LEFT JOIN "MedicalInsurances" mi ON mi.id = p."insuranceId"
  LEFT JOIN "MedicalRecords"    mr ON mr."patientDui" = p.dui
  LEFT JOIN LATERAL (
    SELECT cc.*, ma."bookedAt"
    FROM "ClinicalConsultations" cc
    JOIN "MedicalAppointments"   ma ON ma.id = cc."appointmentId"
    WHERE cc."recordId" = mr.id
    ORDER BY ma."bookedAt" DESC
    LIMIT 1
  ) cc ON true
  LEFT JOIN "MedicalAppointments" ma ON ma.id = cc."appointmentId"
`)
