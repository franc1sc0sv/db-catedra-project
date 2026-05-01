import { injectable } from 'inversify'
import { and, asc, eq, gte, lte, ne } from 'drizzle-orm'
import type { TxClient } from '@project/db/src/client'
import { ScheduleEvents } from '@project/db/src/schema/schedule-events.schema'
import { MedicalAppointments } from '@project/db/src/schema/medical-appointments.schema'
import { Patients } from '@project/db/src/schema/patients.schema'
import {
  IReceptionistScheduleRepository,
  type NewBlockSlot,
  type SlotInput,
} from '../../domain/interfaces/receptionist-schedule.repository'
import type {
  ConflictingAppointment,
  IScheduleEvent,
  ScheduleEventType,
  AvailabilityStatus,
} from '../../domain/entities/schedule-event.entity'

type ScheduleEventRow = typeof ScheduleEvents.$inferSelect

function toEntity(row: ScheduleEventRow): IScheduleEvent {
  return {
    id:                 row.id,
    doctorId:           row.doctorId,
    eventDate:          row.eventDate,
    startTime:          row.startTime,
    endTime:            row.endTime,
    eventType:          row.eventType as ScheduleEventType,
    availabilityStatus: row.availabilityStatus as AvailabilityStatus,
    auditUserId:        row.auditUserId,
  }
}

function blockedStatusFor(eventType: ScheduleEventType): AvailabilityStatus {
  return eventType === 'appointment' ? 'busy' : 'blocked'
}

@injectable()
export class DrizzleReceptionistScheduleRepository extends IReceptionistScheduleRepository {
  findById = async (id: string, tx: TxClient): Promise<IScheduleEvent | null> => {
    const row = await tx.query.ScheduleEvents.findFirst({
      where: eq(ScheduleEvents.id, id),
    })
    return row ? toEntity(row) : null
  }

  findAvailable = async (
    doctorId: string,
    dateFrom: string,
    dateTo: string,
    tx: TxClient,
  ): Promise<IScheduleEvent[]> => {
    const rows = await tx
      .select()
      .from(ScheduleEvents)
      .where(
        and(
          eq(ScheduleEvents.doctorId, doctorId),
          eq(ScheduleEvents.eventType, 'appointment'),
          eq(ScheduleEvents.availabilityStatus, 'available'),
          gte(ScheduleEvents.eventDate, dateFrom),
          lte(ScheduleEvents.eventDate, dateTo), // ✅ FIX aplicado
        ),
      )
      .orderBy(asc(ScheduleEvents.eventDate), asc(ScheduleEvents.startTime))

    return rows.map(toEntity)
  }

  findActiveAppointmentForSlot = async (
    doctorId: string,
    slot: SlotInput,
    tx: TxClient,
  ): Promise<ConflictingAppointment | null> => {
    const rows = await tx
      .select({
        appointmentId: MedicalAppointments.id,
        startTime:     ScheduleEvents.startTime,
        firstName:     Patients.firstName,
        lastName:      Patients.lastName,
      })
      .from(MedicalAppointments)
      .innerJoin(ScheduleEvents, eq(ScheduleEvents.id, MedicalAppointments.eventId))
      .innerJoin(Patients, eq(Patients.dui, MedicalAppointments.patientDui))
      .where(
        and(
          eq(ScheduleEvents.doctorId, doctorId),
          eq(ScheduleEvents.eventDate, slot.date),
          eq(ScheduleEvents.startTime, slot.startTime),
          ne(ScheduleEvents.availabilityStatus, 'cancelled'),
        ),
      )
      .limit(1)

    const row = rows[0]
    if (!row) return null

    return {
      appointmentId: row.appointmentId,
      patientName:   `${row.firstName} ${row.lastName}`.trim(),
      startTime:     row.startTime,
    }
  }

  findActiveAppointmentForEvent = async (
    eventId: string,
    tx: TxClient,
  ): Promise<ConflictingAppointment | null> => {
    const rows = await tx
      .select({
        appointmentId: MedicalAppointments.id,
        startTime:     ScheduleEvents.startTime,
        firstName:     Patients.firstName,
        lastName:      Patients.lastName,
      })
      .from(MedicalAppointments)
      .innerJoin(ScheduleEvents, eq(ScheduleEvents.id, MedicalAppointments.eventId))
      .innerJoin(Patients, eq(Patients.dui, MedicalAppointments.patientDui))
      .where(
        and(
          eq(MedicalAppointments.eventId, eventId),
          ne(ScheduleEvents.availabilityStatus, 'cancelled'),
        ),
      )
      .limit(1)

    const row = rows[0]
    if (!row) return null

    return {
      appointmentId: row.appointmentId,
      patientName:   `${row.firstName} ${row.lastName}`.trim(),
      startTime:     row.startTime,
    }
  }

  insertBlocks = async (
    doctorId: string,
    slots: NewBlockSlot[],
    auditUserId: string,
    tx: TxClient,
  ): Promise<IScheduleEvent[]> => {
    if (slots.length === 0) return []

    const values = slots.map((slot) => ({
      doctorId,
      eventDate:          slot.date,
      startTime:          slot.startTime,
      endTime:            slot.endTime,
      eventType:          slot.eventType,
      availabilityStatus: blockedStatusFor(slot.eventType),
      auditUserId,
    }))

    const inserted = await tx.insert(ScheduleEvents).values(values).returning()

    return inserted.map(toEntity)
  }

  deleteById = async (id: string, tx: TxClient): Promise<void> => {
    await tx.delete(ScheduleEvents).where(eq(ScheduleEvents.id, id))
  }
}