import { pgTable, uuid, varchar, date, index } from 'drizzle-orm/pg-core'
import { Users } from './iam.schema'
import { MedicalInsurances } from './medical-insurances.schema'

export const Patients = pgTable('Patients', {
  dui:           varchar('dui', { length: 10 }).primaryKey(),
  userId:        uuid('userId').references(() => Users.id),
  firstName:     varchar('firstName', { length: 100 }).notNull(),
  lastName:      varchar('lastName', { length: 100 }).notNull(),
  whatsappPhone: varchar('whatsappPhone', { length: 20 }).notNull(),
  birthDate:     date('birthDate').notNull(),
  insuranceId:   uuid('insuranceId').references(() => MedicalInsurances.id),
}, (t) => [
  index('patients_user_id_idx').on(t.userId),
  index('patients_insurance_id_idx').on(t.insuranceId),
])

export type Patient    = typeof Patients.$inferSelect
export type NewPatient = typeof Patients.$inferInsert
