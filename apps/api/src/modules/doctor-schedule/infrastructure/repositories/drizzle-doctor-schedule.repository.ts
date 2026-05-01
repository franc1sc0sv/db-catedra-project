import { injectable } from 'inversify'
import { and, eq, sql } from 'drizzle-orm'
import type { TxClient } from '@project/db/src/client'
import { ScheduleEvents } from '@project/db/src/schema/schedule-events.schema'
import { IDoctorScheduleRepository } from '../../domain/interfaces/doctor-schedule.repository'
import type { ISlotCandidate } from '../../domain/entities/slot-candidate.entity'
import { slotKey } from '../../application/services/calculate-slots'

@injectable()
export class DrizzleDoctorScheduleRepository extends IDoctorScheduleRepository {
  findOverlappingKeys = async (
    doctorId: string,
    candidates: ISlotCandidate[],
    tx: TxClient,
  ): Promise<Set<string>> => {
    const conflicting = new Set<string>()
    if (candidates.length === 0) return conflicting

    const byDate = new Map<string, ISlotCandidate[]>()
    for (const slot of candidates) {
      const list = byDate.get(slot.eventDate) ?? []
      list.push(slot)
      byDate.set(slot.eventDate, list)
    }

    for (const [eventDate, slots] of byDate) {
      const rows = await tx
        .select({
          startTime: ScheduleEvents.startTime,
          endTime:   ScheduleEvents.endTime,
        })
        .from(ScheduleEvents)
        .where(
          and(
            eq(ScheduleEvents.doctorId, doctorId),
            sql`${ScheduleEvents.eventDate} = ${eventDate}`,
          ),
        )

      if (rows.length === 0) continue

      for (const slot of slots) {
        for (const row of rows) {
          if (row.startTime < slot.endTime && row.endTime > slot.startTime) {
            conflicting.add(slotKey(slot))
            break
          }
        }
      }
    }

    return conflicting
  }

  bulkInsert = async (
    doctorId: string,
    candidates: ISlotCandidate[],
    auditUserId: string,
    tx: TxClient,
  ): Promise<void> => {
    if (candidates.length === 0) return
    await tx.insert(ScheduleEvents).values(
      candidates.map((c) => ({
        doctorId,
        eventDate:          c.eventDate,
        startTime:          c.startTime,
        endTime:            c.endTime,
        eventType:          'appointment' as const,
        availabilityStatus: 'available' as const,
        auditUserId,
      })),
    )
  }
}
