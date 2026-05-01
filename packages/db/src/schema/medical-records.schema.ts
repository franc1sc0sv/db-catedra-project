import { pgTable, uuid, varchar, text, date } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { bloodTypeEnum } from './enums'
import { Patients } from './patients.schema'

export const MedicalRecords = pgTable('MedicalRecords', {
  id:                uuid('id').primaryKey().defaultRandom(),
  patientDui:        varchar('patientDui', { length: 10 }).notNull().unique()
                       .references(() => Patients.dui),
  bloodType:         bloodTypeEnum('bloodType'),
  knownAllergies:    text('knownAllergies'),
  familyHistory:     text('familyHistory'),
  chronicConditions: text('chronicConditions'),
  openedAt:          date('openedAt').notNull().default(sql`CURRENT_DATE`),
})

export type MedicalRecord    = typeof MedicalRecords.$inferSelect
export type NewMedicalRecord = typeof MedicalRecords.$inferInsert
