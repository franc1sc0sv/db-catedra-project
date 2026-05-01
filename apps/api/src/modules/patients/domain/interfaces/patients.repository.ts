import type { TxClient } from '@project/db/src/client'
import type { IPatient } from '../entities/patient.entity'
import type { CompleteProfileInput } from '../../application/dtos/inputs/complete-profile.input'

export abstract class IPatientsRepository {
  abstract findById(id: string, tx: TxClient): Promise<IPatient | null>
  abstract findByUserId(userId: string, tx: TxClient): Promise<IPatient | null>
  abstract create(input: CompleteProfileInput, userId: string, tx: TxClient): Promise<IPatient>
  abstract linkUser(dui: string, userId: string, tx: TxClient): Promise<IPatient>
}
