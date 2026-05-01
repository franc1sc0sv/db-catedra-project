import { t } from 'elysia'
import { createRouter } from '~/common/ioc/elysia-base'
import { betterAuthPlugin } from '~/auth-plugin'
import { BookAppointmentUseCase } from '../application/usecases/book-appointment.usecase'
import { GetMyAppointmentsUseCase } from '../application/usecases/get-my-appointments.usecase'
import { BookAppointmentInputSchema } from '../application/dtos/inputs/book-appointment.input'
import { AppointmentOutputSchema } from '../application/dtos/outputs/appointment.output'
import { MyAppointmentsOutputSchema } from '../application/dtos/outputs/my-appointments.output'

export const appointmentsRoutes = createRouter({ prefix: '/appointments' })
  .use(betterAuthPlugin)
  .post(
    '/',
    ({ container, user, body }) =>
      container.get(BookAppointmentUseCase).execute({ ...body, userId: user.id }),
    {
      auth:     true,
      body:     BookAppointmentInputSchema,
      response: AppointmentOutputSchema,
    },
  )
  .get(
    '/my',
    ({ container, user, query }) =>
      container.get(GetMyAppointmentsUseCase).execute({
        userId:   user.id,
        page:     query.page,
        pageSize: query.pageSize,
      }),
    {
      auth:  true,
      query: t.Object({
        page:     t.Optional(t.String()),
        pageSize: t.Optional(t.String()),
      }),
      response: MyAppointmentsOutputSchema,
    },
  )
