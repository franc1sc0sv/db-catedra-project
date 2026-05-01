import { pgTable, uuid, varchar, timestamp, index } from 'drizzle-orm/pg-core'
import { ScheduleEvents } from './schedule-events.schema'
import { Patients } from './patients.schema'

export const MedicalAppointments = pgTable('MedicalAppointments', {
  id:            uuid('id').primaryKey().defaultRandom(),
  eventId:       uuid('eventId').notNull().unique()
                   .references(() => ScheduleEvents.id),
  patientDui:    varchar('patientDui', { length: 10 }).notNull()
                   .references(() => Patients.dui),
  bookingReason: varchar('bookingReason', { length: 500 }).notNull(),
  bookedAt:      timestamp('bookedAt').notNull().defaultNow(),
}, (t) => [
  index('medical_appointments_patient_dui_idx').on(t.patientDui),
])

export type MedicalAppointment    = typeof MedicalAppointments.$inferSelect
export type NewMedicalAppointment = typeof MedicalAppointments.$inferInsert
