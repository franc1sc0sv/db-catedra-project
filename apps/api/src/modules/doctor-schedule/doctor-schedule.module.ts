import type { Container } from 'inversify'
import type { AppModule } from '~/common/ioc/kernel'
import { IDoctorScheduleRepository }       from './domain/interfaces/doctor-schedule.repository'
import { DrizzleDoctorScheduleRepository } from './infrastructure/repositories/drizzle-doctor-schedule.repository'
import { PreviewWeeklyScheduleUseCase }    from './application/usecases/preview-weekly-schedule.usecase'
import { GenerateWeeklyScheduleUseCase }   from './application/usecases/generate-weekly-schedule.usecase'

export class DoctorScheduleModule implements AppModule {
  load(container: Container): void {
    container.bind(IDoctorScheduleRepository).to(DrizzleDoctorScheduleRepository).inRequestScope()
    container.bind(PreviewWeeklyScheduleUseCase).toSelf().inRequestScope()
    container.bind(GenerateWeeklyScheduleUseCase).toSelf().inRequestScope()
  }
}
