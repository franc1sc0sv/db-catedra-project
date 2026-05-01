import type { TxClient } from '@project/db/src/client'
import type {
  IScheduleEvent,
  ScheduleEventType,
  ConflictingAppointment,
} from '../entities/schedule-event.entity'

export interface SlotInput {
  date:      string
  startTime: string
  endTime:   string
}

export interface NewBlockSlot extends SlotInput {
  eventType: ScheduleEventType
}

export abstract class IReceptionistScheduleRepository {
  abstract findById(id: string, tx: TxClient): Promise<IScheduleEvent | null>
  abstract findAvailable(
    doctorId: string,
    dateFrom: string,
    dateTo: string,
    tx: TxClient,
  ): Promise<IScheduleEvent[]>
  abstract findActiveAppointmentForSlot(
    doctorId: string,
    slot: SlotInput,
    tx: TxClient,
  ): Promise<ConflictingAppointment | null>
  abstract findActiveAppointmentForEvent(
    eventId: string,
    tx: TxClient,
  ): Promise<ConflictingAppointment | null>
  abstract insertBlocks(
    doctorId: string,
    slots: NewBlockSlot[],
    auditUserId: string,
    tx: TxClient,
  ): Promise<IScheduleEvent[]>
  abstract deleteById(id: string, tx: TxClient): Promise<void>
}
