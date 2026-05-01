import type { Container } from 'inversify'
import type { AppModule } from '~/common/ioc/kernel'
import { IAppointmentsRepository } from './domain/interfaces/appointments.repository'
import { DrizzleAppointmentsRepository } from './infrastructure/repositories/drizzle-appointments.repository'
import { BookAppointmentUseCase } from './application/usecases/book-appointment.usecase'
import { GetMyAppointmentsUseCase } from './application/usecases/get-my-appointments.usecase'

export class AppointmentsModule implements AppModule {
  load(container: Container): void {
    container.bind(IAppointmentsRepository).to(DrizzleAppointmentsRepository).inRequestScope()
    container.bind(BookAppointmentUseCase).toSelf().inRequestScope()
    container.bind(GetMyAppointmentsUseCase).toSelf().inRequestScope()
  }
}
