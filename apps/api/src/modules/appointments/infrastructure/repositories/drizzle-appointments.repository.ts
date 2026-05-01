import { injectable } from 'inversify'
import { desc, eq, sql } from 'drizzle-orm'
import type { TxClient } from '@project/db/src/client'
import { MedicalAppointments } from '@project/db/src/schema/medical-appointments.schema'
import { ScheduleEvents } from '@project/db/src/schema/schedule-events.schema'
import { ClinicalConsultations } from '@project/db/src/schema/clinical-consultations.schema'
import { AppError } from '~/common/errors/app-error'
import {
  IAppointmentsRepository,
  type AppointmentWithEvent,
  type BookAppointmentData,
  type PaginationInput,
} from '../../domain/interfaces/appointments.repository'
import type { IAppointment } from '../../domain/entities/appointment.entity'

type AppointmentRow = typeof MedicalAppointments.$inferSelect

function toEntity(row: AppointmentRow): IAppointment {
  return {
    id:            row.id,
    eventId:       row.eventId,
    patientDui:    row.patientDui,
    bookingReason: row.bookingReason,
    bookedAt:      row.bookedAt,
  }
}

function isUniqueViolation(err: unknown): boolean {
  return typeof err === 'object'
    && err !== null
    && 'code' in err
    && (err as { code: unknown }).code === '23505'
}

@injectable()
export class DrizzleAppointmentsRepository extends IAppointmentsRepository {
  findById = async (id: string, tx: TxClient): Promise<IAppointment | null> => {
    const row = await tx.query.MedicalAppointments.findFirst({
      where: eq(MedicalAppointments.id, id),
    })
    return row ? toEntity(row) : null
  }

  findByEventId = async (eventId: string, tx: TxClient): Promise<IAppointment | null> => {
    const row = await tx.query.MedicalAppointments.findFirst({
      where: eq(MedicalAppointments.eventId, eventId),
    })
    return row ? toEntity(row) : null
  }

  book = async (data: BookAppointmentData, tx: TxClient): Promise<IAppointment> => {
    try {
      const [row] = await tx
        .insert(MedicalAppointments)
        .values({
          eventId:       data.eventId,
          patientDui:    data.patientDui,
          bookingReason: data.bookingReason,
        })
        .returning()
      return toEntity(row!)
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new AppError('Ese cupo ya no está disponible, elige otro horario', 409)
      }
      throw err
    }
  }

  findByPatientDui = async (
    patientDui: string,
    pagination: PaginationInput,
    tx: TxClient,
  ): Promise<{ items: AppointmentWithEvent[]; total: number }> => {
    const offset = (pagination.page - 1) * pagination.pageSize

    const rows = await tx
      .select({
        id:                  MedicalAppointments.id,
        eventId:             MedicalAppointments.eventId,
        patientDui:          MedicalAppointments.patientDui,
        bookingReason:       MedicalAppointments.bookingReason,
        bookedAt:            MedicalAppointments.bookedAt,
        eventDate:           ScheduleEvents.eventDate,
        startTime:           ScheduleEvents.startTime,
        endTime:             ScheduleEvents.endTime,
        availabilityStatus:  ScheduleEvents.availabilityStatus,
        mainDiagnosis:       ClinicalConsultations.mainDiagnosis,
        prescribedTreatment: ClinicalConsultations.prescribedTreatment,
      })
      .from(MedicalAppointments)
      .innerJoin(ScheduleEvents, eq(ScheduleEvents.id, MedicalAppointments.eventId))
      .leftJoin(
        ClinicalConsultations,
        eq(ClinicalConsultations.appointmentId, MedicalAppointments.id),
      )
      .where(eq(MedicalAppointments.patientDui, patientDui))
      .orderBy(desc(ScheduleEvents.eventDate), desc(ScheduleEvents.startTime))
      .limit(pagination.pageSize)
      .offset(offset)

    const [{ count }] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(MedicalAppointments)
      .where(eq(MedicalAppointments.patientDui, patientDui))

    return {
      items: rows.map((row) => ({
        id:                  row.id,
        eventId:             row.eventId,
        patientDui:          row.patientDui,
        bookingReason:       row.bookingReason,
        bookedAt:            row.bookedAt,
        eventDate:           row.eventDate,
        startTime:           row.startTime,
        endTime:             row.endTime,
        availabilityStatus:  row.availabilityStatus,
        mainDiagnosis:       row.mainDiagnosis,
        prescribedTreatment: row.prescribedTreatment,
      })),
      total: count ?? 0,
    }
  }
}
