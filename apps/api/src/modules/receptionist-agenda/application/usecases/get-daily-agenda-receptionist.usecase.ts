import { injectable } from 'inversify'
import type { TxClient } from '@project/db/src/client'
import { BaseUseCase } from '~/common/base/base-use-case.abstract'
import { IReceptionistAgendaRepository } from '../../domain/interfaces/receptionist-agenda.repository'
import type { ReceptionistAgendaItemOutput } from '../dtos/outputs/receptionist-agenda-item.output'

interface Input {
  doctorId: string
  fecha?:   string
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

@injectable()
export class GetDailyAgendaReceptionistUseCase
  extends BaseUseCase<Input, ReceptionistAgendaItemOutput[]> {

  constructor(private readonly agenda: IReceptionistAgendaRepository) { super() }

  protected async handle(
    { doctorId, fecha }: Input,
    tx: TxClient,
  ): Promise<ReceptionistAgendaItemOutput[]> {
    const targetDate = fecha ?? todayIso()
    const slots = await this.agenda.getDailyAgendaForReceptionist(doctorId, targetDate, tx)
    return slots.map((slot) => ({
      slotId:             slot.slotId,
      startTime:          slot.startTime,
      endTime:            slot.endTime,
      availabilityStatus: slot.availabilityStatus,
      patientName:        slot.patientName,
      bookingReason:      slot.bookingReason,
      whatsappPhone:      slot.whatsappPhone,
      appointmentId:      slot.appointmentId,
    }))
  }
}
