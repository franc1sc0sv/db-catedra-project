import { injectable } from 'inversify'
import type { TxClient } from '@project/db/src/client'
import { BaseUseCase } from '~/common/base/base-use-case.abstract'
import { AppError } from '~/common/errors/app-error'
import { IReceptionistScheduleRepository } from '../../domain/interfaces/receptionist-schedule.repository'
import type { AvailableSlotOutput } from '../dtos/outputs/available-slot.output'

@injectable()
export class GetScheduleEventUseCase extends BaseUseCase<{ id: string }, AvailableSlotOutput> {
  constructor(private readonly events: IReceptionistScheduleRepository) { super() }

  protected async handle({ id }: { id: string }, tx: TxClient): Promise<AvailableSlotOutput> {
    const slot = await this.events.findById(id, tx)
    if (!slot) throw new AppError('Cupo no encontrado', 404)
    return {
      id:        slot.id,
      doctorId:  slot.doctorId,
      eventDate: slot.eventDate,
      startTime: slot.startTime,
      endTime:   slot.endTime,
    }
  }
}
