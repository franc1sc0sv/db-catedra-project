import { injectable } from 'inversify'
import type { TxClient } from '@project/db/src/client'
import { BaseUseCase } from '~/common/base/base-use-case.abstract'
import { AppError } from '~/common/errors/app-error'
import { IAppointmentsRepository } from '../../domain/interfaces/appointments.repository'
import { IPatientsRepository } from '~/modules/patients/domain/interfaces/patients.repository'
import type {
  MyAppointmentsOutput,
  PastAppointmentDto,
  UpcomingAppointmentDto,
} from '../dtos/outputs/my-appointments.output'

interface Input {
  userId:   string
  page?:    string | number
  pageSize?: string | number
}

function toPositiveInt(value: unknown, fallback: number): number {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback
}

function todayIso(): string {
  const d = new Date()
  const pad = (n: number) => (n < 10 ? `0${n}` : String(n))
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
}

@injectable()
export class GetMyAppointmentsUseCase extends BaseUseCase<Input, MyAppointmentsOutput> {
  constructor(
    private readonly appointments: IAppointmentsRepository,
    private readonly patients:     IPatientsRepository,
  ) { super() }

  protected async handle(input: Input, tx: TxClient): Promise<MyAppointmentsOutput> {
    const patient = await this.patients.findByUserId(input.userId, tx)
    if (!patient) {
      throw new AppError('Debes completar tu perfil antes de ver tus citas', 422)
    }

    const page     = toPositiveInt(input.page, 1)
    const pageSize = toPositiveInt(input.pageSize, 10)

    const { items, total } = await this.appointments.findByPatientDui(
      patient.dui,
      { page, pageSize },
      tx,
    )

    const today = todayIso()
    const upcoming: UpcomingAppointmentDto[] = []
    const past:     PastAppointmentDto[]     = []

    for (const item of items) {
      if (item.eventDate >= today) {
        upcoming.push({
          id:            item.id,
          eventDate:     item.eventDate,
          startTime:     item.startTime,
          endTime:       item.endTime,
          bookingReason: item.bookingReason,
          status:        item.availabilityStatus,
        })
      } else {
        past.push({
          id:                  item.id,
          eventDate:           item.eventDate,
          startTime:           item.startTime,
          endTime:             item.endTime,
          bookingReason:       item.bookingReason,
          status:              item.availabilityStatus,
          mainDiagnosis:       item.mainDiagnosis,
          prescribedTreatment: item.prescribedTreatment,
        })
      }
    }

    upcoming.sort((a, b) =>
      a.eventDate === b.eventDate ? a.startTime.localeCompare(b.startTime) : a.eventDate.localeCompare(b.eventDate),
    )
    past.sort((a, b) =>
      a.eventDate === b.eventDate ? b.startTime.localeCompare(a.startTime) : b.eventDate.localeCompare(a.eventDate),
    )

    return {
      upcoming,
      past,
      total,
      page,
      pageSize,
    }
  }
}
