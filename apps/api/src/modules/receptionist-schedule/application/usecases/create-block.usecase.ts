import { injectable } from 'inversify'
import type { TxClient } from '@project/db/src/client'
import { BaseUseCase } from '~/common/base/base-use-case.abstract'
import { AppError } from '~/common/errors/app-error'
import { IReceptionistScheduleRepository } from '../../domain/interfaces/receptionist-schedule.repository'
import type { ScheduleEventType } from '../../domain/entities/schedule-event.entity'
import type { CreateBlockInput } from '../dtos/inputs/create-block.input'
import type { ScheduleEventOutput } from '../dtos/outputs/schedule-event.output'

const SLOT_MINUTES = 30

interface Input extends CreateBlockInput {
  auditUserId: string
}

function timeToMinutes(value: string): number {
  const [h, m] = value.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

function minutesToTime(total: number): string {
  const h = Math.floor(total / 60).toString().padStart(2, '0')
  const m = (total % 60).toString().padStart(2, '0')
  return `${h}:${m}:00`
}

interface PlannedSlot {
  date:      string
  startTime: string
  endTime:   string
}

function planSlots(date: string, startTime: string, endTime: string): PlannedSlot[] {
  const start = timeToMinutes(startTime)
  const end   = timeToMinutes(endTime)
  if (end <= start) {
    throw new AppError('La hora de inicio debe ser menor que la de fin', 400)
  }
  if ((end - start) % SLOT_MINUTES !== 0) {
    throw new AppError(`El rango debe ser múltiplo de ${SLOT_MINUTES} minutos`, 400)
  }
  const slots: PlannedSlot[] = []
  for (let cur = start; cur < end; cur += SLOT_MINUTES) {
    slots.push({
      date,
      startTime: minutesToTime(cur),
      endTime:   minutesToTime(cur + SLOT_MINUTES),
    })
  }
  return slots
}

@injectable()
export class CreateBlockUseCase extends BaseUseCase<Input, ScheduleEventOutput[]> {
  constructor(private readonly events: IReceptionistScheduleRepository) { super() }

  protected async handle(input: Input, tx: TxClient): Promise<ScheduleEventOutput[]> {
    const slots = planSlots(input.date, input.startTime, input.endTime)

    for (const slot of slots) {
      const conflict = await this.events.findActiveAppointmentForSlot(input.doctorId, slot, tx)
      if (conflict) {
        throw new AppError(
          `El slot ${conflict.startTime} tiene una cita activa con ${conflict.patientName}, cancélala primero`,
          409,
        )
      }
    }

    const events = await this.events.insertBlocks(
      input.doctorId,
      slots.map((slot) => ({ ...slot, eventType: input.blockType as ScheduleEventType })),
      input.auditUserId,
      tx,
    )

    return events.map((event) => ({
      id:                 event.id,
      doctorId:           event.doctorId,
      eventDate:          event.eventDate,
      startTime:          event.startTime,
      endTime:            event.endTime,
      eventType:          event.eventType,
      availabilityStatus: event.availabilityStatus,
    }))
  }
}
