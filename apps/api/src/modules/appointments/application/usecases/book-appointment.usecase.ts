import { injectable } from 'inversify'
import type { TxClient } from '@project/db/src/client'
import { BaseUseCase } from '~/common/base/base-use-case.abstract'
import { AppError } from '~/common/errors/app-error'
import { IAppointmentsRepository } from '../../domain/interfaces/appointments.repository'
import { IReceptionistScheduleRepository } from '~/modules/receptionist-schedule/domain/interfaces/receptionist-schedule.repository'
import { IPatientsRepository } from '~/modules/patients/domain/interfaces/patients.repository'
import type { BookAppointmentInput } from '../dtos/inputs/book-appointment.input'
import type { AppointmentOutput } from '../dtos/outputs/appointment.output'

interface Input extends BookAppointmentInput {
  userId: string
}

@injectable()
export class BookAppointmentUseCase extends BaseUseCase<Input, AppointmentOutput> {
  constructor(
    private readonly appointments: IAppointmentsRepository,
    private readonly events:       IReceptionistScheduleRepository,
    private readonly patients:     IPatientsRepository,
  ) { super() }

  protected async handle(input: Input, tx: TxClient): Promise<AppointmentOutput> {
    const patient = await this.patients.findByUserId(input.userId, tx)
    if (!patient) {
      throw new AppError('Debes completar tu perfil antes de reservar', 422)
    }

    const slot = await this.events.findById(input.eventId, tx)
    if (!slot || slot.eventType !== 'appointment' || slot.availabilityStatus !== 'available') {
      throw new AppError('Ese cupo ya no está disponible, elige otro horario', 409)
    }

    const appointment = await this.appointments.book(
      {
        eventId:       input.eventId,
        patientDui:    patient.dui,
        bookingReason: input.bookingReason,
      },
      tx,
    )

    return {
      id:            appointment.id,
      eventId:       appointment.eventId,
      patientDui:    appointment.patientDui,
      bookingReason: appointment.bookingReason,
      bookedAt:      appointment.bookedAt,
    }
  }
}
