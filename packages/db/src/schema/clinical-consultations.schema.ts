import { pgTable, uuid, varchar, numeric, text, index } from 'drizzle-orm/pg-core'
import { MedicalRecords } from './medical-records.schema'
import { MedicalAppointments } from './medical-appointments.schema'

export const ClinicalConsultations = pgTable('ClinicalConsultations', {
  id:                  uuid('id').primaryKey().defaultRandom(),
  recordId:            uuid('recordId').notNull()
                         .references(() => MedicalRecords.id),
  appointmentId:       uuid('appointmentId').notNull().unique()
                         .references(() => MedicalAppointments.id),
  presentedSymptoms:   text('presentedSymptoms').notNull(),
  bloodPressure:       varchar('bloodPressure', { length: 20 }),
  weightKg:            numeric('weightKg', { precision: 5, scale: 2 }),
  mainDiagnosis:       text('mainDiagnosis').notNull(),
  prescribedTreatment: text('prescribedTreatment').notNull(),
  doctorPrivateNotes:  text('doctorPrivateNotes'),
}, (t) => [
  index('clinical_consultations_record_id_idx').on(t.recordId),
])

export type ClinicalConsultation    = typeof ClinicalConsultations.$inferSelect
export type NewClinicalConsultation = typeof ClinicalConsultations.$inferInsert
