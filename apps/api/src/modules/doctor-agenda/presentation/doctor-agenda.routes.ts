import { t } from 'elysia'
import { createRouter } from '~/common/ioc/elysia-base'
import { betterAuthPlugin } from '~/auth-plugin'
import { GetDailyAgendaUseCase } from '../application/usecases/get-daily-agenda.usecase'
import { BlockSlotUseCase } from '../application/usecases/block-slot.usecase'
import { AgendaListOutputSchema } from '../application/dtos/outputs/agenda-item.output'

export const doctorAgendaRoutes = createRouter({ prefix: '/doctor' })
  .use(betterAuthPlugin)

  .get(
    '/agenda',
    ({ container, query, user }) =>
      container.get(GetDailyAgendaUseCase).execute({
        doctorId: user.id,
        fecha: query.fecha,
      }),
    {
      roles: ['doctor'],
      query: t.Object({
        fecha: t.String({ pattern: '^\\d{4}-\\d{2}-\\d{2}$' }),
      }),
      response: AgendaListOutputSchema,
    },
  )

  .post(
    '/block-slot',
    ({ container, body, user }) =>
      container.get(BlockSlotUseCase).execute({
        doctorId: user.id,
        fecha: body.fecha,
        start: body.start,
        end: body.end,
      }),
    {
      roles: ['doctor'],
      body: t.Object({
        fecha: t.String(),
        start: t.String(),
        end: t.String(),
      }),
    },
  )