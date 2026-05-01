import { createRouter } from '~/common/ioc/elysia-base'
import { HealthCheckUseCase } from '../application/usecases/health-check.usecase'
import { HealthOutputSchema } from '../application/dtos/outputs/health.output'

export const healthRoutes = createRouter()
  .get(
    '/',
    ({ container }) => container.get(HealthCheckUseCase).execute(),
    { response: HealthOutputSchema },
  )
