import type { Container } from 'inversify'
import type { AppModule } from '~/common/ioc/kernel'
import { IReceptionistAgendaRepository } from './domain/interfaces/receptionist-agenda.repository'
import { DrizzleReceptionistAgendaRepository } from './infrastructure/repositories/drizzle-receptionist-agenda.repository'
import { GetDailyAgendaReceptionistUseCase } from './application/usecases/get-daily-agenda-receptionist.usecase'

export class ReceptionistAgendaModule implements AppModule {
  load(container: Container): void {
    container
      .bind(IReceptionistAgendaRepository)
      .to(DrizzleReceptionistAgendaRepository)
      .inRequestScope()
    container.bind(GetDailyAgendaReceptionistUseCase).toSelf().inRequestScope()
  }
}
