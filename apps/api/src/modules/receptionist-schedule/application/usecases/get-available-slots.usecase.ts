import { injectable } from 'inversify'
import type { TxClient } from '@project/db/src/client'
import { BaseUseCase } from '~/common/base/base-use-case.abstract'
import { IReceptionistScheduleRepository } from '../../domain/interfaces/receptionist-schedule.repository'
import type { AvailableSlotOutput } from '../dtos/outputs/available-slot.output'

interface Input {
  doctorId: string
  dateFrom: string
  dateTo:   string
}

@injectable()
export class GetAvailableSlotsUseCase extends BaseUseCase<Input, AvailableSlotOutput[]> {
  constructor(private readonly events: IReceptionistScheduleRepository) { super() }

  protected async handle(
    { doctorId, dateFrom, dateTo }: Input,
    tx: TxClient,
  ): Promise<AvailableSlotOutput[]> {
    const slots = await this.events.findAvailable(doctorId, dateFrom, dateTo, tx)
    return slots.map((slot) => ({
      id:        slot.id,
      doctorId:  slot.doctorId,
      eventDate: slot.eventDate,
      startTime: slot.startTime,
      endTime:   slot.endTime,
    }))
  }
}
