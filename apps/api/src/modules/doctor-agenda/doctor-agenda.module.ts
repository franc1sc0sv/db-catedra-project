import type { Container } from 'inversify'
import type { AppModule } from '~/common/ioc/kernel'
import { IDoctorAgendaRepository }       from './domain/interfaces/doctor-agenda.repository'
import { DrizzleDoctorAgendaRepository } from './infrastructure/repositories/drizzle-doctor-agenda.repository'
import { GetDailyAgendaUseCase }   from './application/usecases/get-daily-agenda.usecase'
import { BlockSlotUseCase } from './application/usecases/block-slot.usecase'

export class DoctorAgendaModule implements AppModule {
  load(container: Container): void {
    container.bind(IDoctorAgendaRepository).to(DrizzleDoctorAgendaRepository).inRequestScope()
    container.bind(GetDailyAgendaUseCase).toSelf().inRequestScope()
    container.bind(BlockSlotUseCase).toSelf().inRequestScope()
  }
}