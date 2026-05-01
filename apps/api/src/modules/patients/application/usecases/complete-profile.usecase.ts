import { injectable } from 'inversify'
import type { TxClient } from '@project/db/src/client'
import { BaseUseCase } from '~/common/base/base-use-case.abstract'
import { AppError } from '~/common/errors/app-error'
import { IPatientsRepository } from '../../domain/interfaces/patients.repository'
import type { CompleteProfileInput } from '../dtos/inputs/complete-profile.input'
import type { PatientOutput } from '../dtos/outputs/patient.output'

interface Input extends CompleteProfileInput {
  userId: string
}

@injectable()
export class CompleteProfileUseCase extends BaseUseCase<Input, PatientOutput> {
  constructor(private readonly patients: IPatientsRepository) { super() }

  protected async handle(input: Input, tx: TxClient): Promise<PatientOutput> {
    const { userId, ...profile } = input

    const existing = await this.patients.findById(profile.dui, tx)
    let patient

    if (!existing) {
      patient = await this.patients.create(profile, userId, tx)
    } else if (existing.userId === null) {
      patient = await this.patients.linkUser(existing.dui, userId, tx)
    } else if (existing.userId === userId) {
      patient = existing
    } else {
      throw new AppError('Ese DUI ya está asociado a otra cuenta', 409)
    }

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
