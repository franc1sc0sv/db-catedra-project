import type { TxClient } from '@project/db/src/client'
import type { IAppointment } from '../entities/appointment.entity'

export interface AppointmentWithEvent extends IAppointment {
  eventDate:           string
  startTime:           string
  endTime:             string
  availabilityStatus:  string
  mainDiagnosis:       string | null
  prescribedTreatment: string | null
}

export interface PaginationInput {
  page:     number
  pageSize: number
}

export interface BookAppointmentData {
  eventId:       string
  patientDui:    string
  bookingReason: string
}

export interface PaginatedAppointments {
  items: AppointmentWithEvent[]
  total: number
}

export abstract class IAppointmentsRepository {
  abstract findById(id: string, tx: TxClient): Promise<IAppointment | null>
  abstract findByEventId(eventId: string, tx: TxClient): Promise<IAppointment | null>
  abstract book(data: BookAppointmentData, tx: TxClient): Promise<IAppointment>
  abstract findByPatientDui(
    patientDui: string,
    pagination: PaginationInput,
    tx: TxClient,
  ): Promise<PaginatedAppointments>
}
