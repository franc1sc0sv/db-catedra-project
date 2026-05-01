import { injectable } from 'inversify'
import { and, asc, eq, inArray, lt, gt } from 'drizzle-orm'
import { db } from '@project/db/src/client'
import { DailyScheduleView } from '@project/db/src/schema/views'
import { ClinicalConsultations } from '@project/db/src/schema/clinical-consultations.schema'
import { ScheduleEvents } from '@project/db/src/schema/schedule-events.schema'
import { IDoctorAgendaRepository } from '../../domain/interfaces/doctor-agenda.repository'
import type { AgendaStatus, IAgendaItem } from '../../domain/entities/agenda-item.entity'

type ViewRow = {
  eventId: string | null
  startTime: string | null
  endTime: string | null
  availabilityStatus: string | null
  appointmentId: string | null
  bookingReason: string | null
  patientDui: string | null
  firstName: string | null
  lastName: string | null
}

function mapStatus(value: string | null): AgendaStatus {
  switch (value) {
    case 'busy': return 'reservado'
    case 'completed': return 'completado'
    case 'cancelled': return 'cancelado'
    case 'blocked': return 'cancelado'
    default: return 'disponible'
  }
}

function buildPatientName(row: ViewRow): string | null {
  if (!row.firstName && !row.lastName) return null
  return [row.firstName, row.lastName].filter(Boolean).join(' ').trim() || null
}

function toEntity(row: ViewRow, diagnoses: Map<string, string>): IAgendaItem {
  const status = mapStatus(row.availabilityStatus)
  const diagnosis = row.appointmentId ? diagnoses.get(row.appointmentId) ?? null : null

  return {
    slotId: row.eventId ?? '',
    startTime: row.startTime ?? '',
    endTime: row.endTime ?? '',
    patientId: row.patientDui ?? null,
    patientName: buildPatientName(row),
    bookingReason: row.bookingReason ?? null,
    status,
    mainDiagnosis: status === 'completado' ? diagnosis : null,
  }
}

@injectable()
export class DrizzleDoctorAgendaRepository extends IDoctorAgendaRepository {

  async getDailyAgenda(doctorId: string, fecha: string): Promise<IAgendaItem[]> {
    const rows = await db
      .select({
        eventId: DailyScheduleView.eventId,
        startTime: DailyScheduleView.startTime,
        endTime: DailyScheduleView.endTime,
        availabilityStatus: DailyScheduleView.availabilityStatus,
        appointmentId: DailyScheduleView.appointmentId,
        bookingReason: DailyScheduleView.bookingReason,
        patientDui: DailyScheduleView.patientDui,
        firstName: DailyScheduleView.firstName,
        lastName: DailyScheduleView.lastName,
      })
      .from(DailyScheduleView)
      .where(
        and(
          eq(DailyScheduleView.doctorId, doctorId),
          eq(DailyScheduleView.eventDate, fecha),
        ),
      )
      .orderBy(asc(DailyScheduleView.startTime))

    const appointmentIds = rows
      .map((r) => r.appointmentId)
      .filter((id): id is string => Boolean(id))

    const diagnoses = new Map<string, string>()

    if (appointmentIds.length > 0) {
      const consultations = await db
        .select({
          appointmentId: ClinicalConsultations.appointmentId,
          mainDiagnosis: ClinicalConsultations.mainDiagnosis,
        })
        .from(ClinicalConsultations)
        .where(inArray(ClinicalConsultations.appointmentId, appointmentIds))

      for (const c of consultations) {
        diagnoses.set(c.appointmentId, c.mainDiagnosis)
      }
    }

    return rows.map((r) => toEntity(r as ViewRow, diagnoses))
  }

  async hasOverlap(input: {
    doctorId: string
    fecha: string
    start: string
    end: string
  }): Promise<boolean> {
    const { doctorId, fecha, start, end } = input

    const result = await db
      .select()
      .from(ScheduleEvents)
      .where(
        and(
          eq(ScheduleEvents.doctorId, doctorId),
          eq(ScheduleEvents.eventDate, fecha),
          lt(ScheduleEvents.startTime, end),
          gt(ScheduleEvents.endTime, start),
          eq(ScheduleEvents.availabilityStatus, 'blocked'),
        )
      )

    return result.length > 0
  }

  async blockSlot(input: {
    doctorId: string
    fecha: string
    start: string
    end: string
  }): Promise<void> {
    const { doctorId, fecha, start, end } = input

    const updated = await db
      .update(ScheduleEvents)
      .set({
        eventType: 'block',
        availabilityStatus: 'blocked',
      })
      .where(
        and(
          eq(ScheduleEvents.doctorId, doctorId),
          eq(ScheduleEvents.eventDate, fecha),
          eq(ScheduleEvents.startTime, start),
          eq(ScheduleEvents.endTime, end),
        )
      )
      .returning()

    if (updated.length === 0) {
      await db.insert(ScheduleEvents).values({
        doctorId,
        eventDate: fecha,
        startTime: start,
        endTime: end,
        eventType: 'block',
        availabilityStatus: 'blocked',
      })
    }
  }
}