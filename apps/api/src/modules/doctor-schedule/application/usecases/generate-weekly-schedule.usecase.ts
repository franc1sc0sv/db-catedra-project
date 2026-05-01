import { injectable } from 'inversify'
import type { TxClient } from '@project/db/src/client'
import { BaseUseCase } from '~/common/base/base-use-case.abstract'
import { AppError } from '~/common/errors/app-error'
import { IDoctorScheduleRepository } from '../../domain/interfaces/doctor-schedule.repository'
import { calculateSlots, slotKey } from '../services/calculate-slots'
import type { GenerateScheduleInput } from '../dtos/inputs/generate-schedule.input'
import type { GenerateScheduleOutput } from '../dtos/outputs/generate-schedule.output'

export interface GenerateWeeklyScheduleCommand extends GenerateScheduleInput {
  doctorId:    string
  auditUserId: string
}

@injectable()
export class GenerateWeeklyScheduleUseCase extends BaseUseCase<
  GenerateWeeklyScheduleCommand,
  GenerateScheduleOutput
> {
  constructor(private readonly repo: IDoctorScheduleRepository) { super() }

  protected async handle(input: GenerateWeeklyScheduleCommand, tx: TxClient): Promise<GenerateScheduleOutput> {
    if (input.endTime <= input.startTime) {
      throw new AppError('La hora de fin debe ser posterior a la hora de inicio', 400)
    }
    const candidates = calculateSlots(input)
    if (candidates.length === 0) {
      return { created: 0, skipped: 0 }
    }
    const conflictKeys = await this.repo.findOverlappingKeys(input.doctorId, candidates, tx)
    const toInsert = candidates.filter((c) => !conflictKeys.has(slotKey(c)))
    if (toInsert.length > 0) {
      await this.repo.bulkInsert(input.doctorId, toInsert, input.auditUserId, tx)
    }
    return { created: toInsert.length, skipped: conflictKeys.size }
  }
}
