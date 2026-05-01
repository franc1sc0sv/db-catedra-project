import { t } from 'elysia'
import { createRouter } from '~/common/ioc/elysia-base'
import { betterAuthPlugin } from '~/auth-plugin'
import { GetDailyAgendaReceptionistUseCase } from '../application/usecases/get-daily-agenda-receptionist.usecase'
import { ReceptionistAgendaListOutputSchema } from '../application/dtos/outputs/receptionist-agenda-item.output'

export const agendaRoutes = createRouter({ prefix: '/agenda' })
  .use(betterAuthPlugin)
  .get(
    '/daily',
    ({ container, query }) =>
      container.get(GetDailyAgendaReceptionistUseCase).execute({
        doctorId: query.doctor_id,
        fecha:    query.fecha,
      }),
    {
      roles:    ['receptionist', 'doctor'],
      query:    t.Object({
        doctor_id: t.String({ format: 'uuid' }),
        fecha:     t.Optional(t.String()),
      }),
      response: ReceptionistAgendaListOutputSchema,
    },
  )
