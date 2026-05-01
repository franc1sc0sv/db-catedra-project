import { injectable } from 'inversify'
import { eq } from 'drizzle-orm'
import type { TxClient } from '@project/db/src/client'
import { Patients } from '@project/db/src/schema/patients.schema'
import { IPatientsRepository } from '../../domain/interfaces/patients.repository'
import type { IPatient } from '../../domain/entities/patient.entity'
import type { CompleteProfileInput } from '../../application/dtos/inputs/complete-profile.input'

type PatientRow = typeof Patients.$inferSelect

function toEntity(row: PatientRow): IPatient {
  return {
    dui:           row.dui,
    userId:        row.userId,
    firstName:     row.firstName,
    lastName:      row.lastName,
    whatsappPhone: row.whatsappPhone,
    birthDate:     row.birthDate,
    insuranceId:   row.insuranceId,
  }
}

@injectable()
export class DrizzlePatientsRepository extends IPatientsRepository {
  findById = async (dui: string, tx: TxClient): Promise<IPatient | null> => {
    const row = await tx.query.Patients.findFirst({ where: eq(Patients.dui, dui) })
    return row ? toEntity(row) : null
  }

  findByUserId = async (userId: string, tx: TxClient): Promise<IPatient | null> => {
    const row = await tx.query.Patients.findFirst({ where: eq(Patients.userId, userId) })
    return row ? toEntity(row) : null
  }

  create = async (input: CompleteProfileInput, userId: string, tx: TxClient): Promise<IPatient> => {
    const [row] = await tx.insert(Patients).values({
      dui:           input.dui,
      userId,
      firstName:     input.firstName,
      lastName:      input.lastName,
      whatsappPhone: input.whatsapp,
      birthDate:     input.birthDate,
      insuranceId:   input.insuranceId ?? null,
    }).returning()
    return toEntity(row!)
  }

  linkUser = async (dui: string, userId: string, tx: TxClient): Promise<IPatient> => {
    const [row] = await tx.update(Patients)
      .set({ userId })
      .where(eq(Patients.dui, dui))
      .returning()
    return toEntity(row!)
  }
}
