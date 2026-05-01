import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core'
import { coverageTypeEnum } from './enums'

export const MedicalInsurances = pgTable('MedicalInsurances', {
  id:           uuid('id').primaryKey().defaultRandom(),
  insurerName:  varchar('insurerName', { length: 255 }).notNull(),
  coverageType: coverageTypeEnum('coverageType').notNull(),
})

export type MedicalInsurance    = typeof MedicalInsurances.$inferSelect
export type NewMedicalInsurance = typeof MedicalInsurances.$inferInsert
