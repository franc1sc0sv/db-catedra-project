import { createRouter } from '~/common/ioc/elysia-base'
import { betterAuthPlugin } from '~/auth-plugin'
import { GenerateScheduleInputSchema } from '../application/dtos/inputs/generate-schedule.input'
import { PreviewScheduleOutputSchema } from '../application/dtos/outputs/preview-schedule.output'
import { GenerateScheduleOutputSchema } from '../application/dtos/outputs/generate-schedule.output'
import { PreviewWeeklyScheduleUseCase } from '../application/usecases/preview-weekly-schedule.usecase'
import { GenerateWeeklyScheduleUseCase } from '../application/usecases/generate-weekly-schedule.usecase'

export const doctorScheduleRoutes = createRouter({ prefix: '/doctor' })
  .use(betterAuthPlugin)
  .post(
    '/schedule/preview',
    ({ container, body, user }) =>
      container.get(PreviewWeeklyScheduleUseCase).execute({ ...body, doctorId: user.id }),
    {
      roles:    ['doctor'],
      body:     GenerateScheduleInputSchema,
      response: PreviewScheduleOutputSchema,
    },
  )
  .post(
    '/schedule/generate',
    ({ container, body, user }) =>
      container.get(GenerateWeeklyScheduleUseCase).execute({
        ...body,
        doctorId:    user.id,
        auditUserId: user.id,
      }),
    {
      roles:    ['doctor'],
      body:     GenerateScheduleInputSchema,
      response: GenerateScheduleOutputSchema,
    },
  )
