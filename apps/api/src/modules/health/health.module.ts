import type { Container } from 'inversify'
import type { AppModule } from '~/common/ioc/kernel'
import { HealthCheckUseCase } from './application/usecases/health-check.usecase'

export class HealthModule implements AppModule {
  load(container: Container): void {
    container.bind(HealthCheckUseCase).toSelf().inRequestScope()
  }
}
