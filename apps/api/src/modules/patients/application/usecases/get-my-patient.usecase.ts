import { injectable } from 'inversify'
import type { TxClient } from '@project/db/src/client'
import { BaseUseCase } from '~/common/base/base-use-case.abstract'
import { IPatientsRepository } from '../../domain/interfaces/patients.repository'
import type { PatientOutput } from '../dtos/outputs/patient.output'

@injectable()
export class GetMyPatientUseCase extends BaseUseCase<{ userId: string }, PatientOutput | null> {
  constructor(private readonly patients: IPatientsRepository) { super() }

  protected async handle({ userId }: { userId: string }, tx: TxClient): Promise<PatientOutput | null> {
    const patient = await this.patients.findByUserId(userId, tx)
    if (!patient) return null
    return {
      dui:           patient.dui,
      userId:        patient.userId,
      firstName:     patient.firstName,
      lastName:      patient.lastName,
      whatsappPhone: patient.whatsappPhone,
      birthDate:     patient.birthDate,
      insuranceId:   patient.insuranceId,
    }
  }
}
