import { injectable } from 'inversify'
import { and, asc, eq } from 'drizzle-orm'
import type { TxClient } from '@project/db/src/client'
import { DailyScheduleView } from '@project/db/src/schema/views'
import { IReceptionistAgendaRepository } from '../../domain/interfaces/receptionist-agenda.repository'
import type { IAgendaSlot } from '../../domain/entities/agenda-slot.entity'

type DailyScheduleRow = typeof DailyScheduleView.$inferSelect

function toAgendaSlot(row: DailyScheduleRow): IAgendaSlot {
  const fullName = [row.firstName, row.lastName].filter(Boolean).join(' ').trim()
  return {
    slotId:             row.eventId ?? '',
    eventDate:          row.eventDate ?? '',
    startTime:          row.startTime ?? '',
    endTime:            row.endTime ?? '',
    availabilityStatus: row.availabilityStatus ?? 'available',
    patientName:        fullName.length > 0 ? fullName : null,
    bookingReason:      row.bookingReason ?? null,
    whatsappPhone:      row.whatsappPhone ?? null,
    appointmentId:      row.appointmentId ?? null,
  }
}

@injectable()
export class DrizzleReceptionistAgendaRepository extends IReceptionistAgendaRepository {
  getDailyAgendaForReceptionist = async (
    doctorId: string,
    fecha: string,
    tx: TxClient,
  ): Promise<IAgendaSlot[]> => {
    const rows = await tx
      .select()
      .from(DailyScheduleView)
      .where(
        and(
          eq(DailyScheduleView.doctorId, doctorId),
          eq(DailyScheduleView.eventDate, fecha),
        ),
      )
      .orderBy(asc(DailyScheduleView.startTime))
    return rows.map(toAgendaSlot)
  }
}
