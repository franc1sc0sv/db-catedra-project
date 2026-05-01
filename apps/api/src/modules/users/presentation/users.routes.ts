import { t } from 'elysia'
import { UserRole } from '@project/enums/src/user-role.enum'
import { createRouter } from '~/common/ioc/elysia-base'
import { betterAuthPlugin } from '~/auth-plugin'
import { GetMeUseCase }              from '../application/usecases/get-me.usecase'
import { ListUsersUseCase }          from '../application/usecases/list-users.usecase'
import { ListActiveDoctorsUseCase }  from '../application/usecases/list-active-doctors.usecase'
import { CreateUserUseCase }         from '../application/usecases/create-user.usecase'
import { UpdateUserUseCase }         from '../application/usecases/update-user.usecase'
import { DeactivateUserUseCase }     from '../application/usecases/deactivate-user.usecase'
import { CreateUserInputSchema }     from '../application/dtos/inputs/create-user.input'
import { UpdateUserInputSchema }     from '../application/dtos/inputs/update-user.input'
import {
  UserOutputSchema,
  UsersListOutputSchema,
  DoctorRefListOutputSchema,
} from '../application/dtos/outputs/user.output'

export const usersRoutes = createRouter({ prefix: '/users' })
  .use(betterAuthPlugin)
  .get(
    '/me',
    ({ container, user }) => container.get(GetMeUseCase).execute({ id: user.id }),
    { response: UserOutputSchema, auth: true },
  )
  .get(
    '/doctors',
    ({ container }) => container.get(ListActiveDoctorsUseCase).execute(),
    { response: DoctorRefListOutputSchema, auth: true },
  )
  .get(
    '/list',
    ({ container, query }) =>
      container.get(ListUsersUseCase).execute({
        role:     query.role as UserRole | undefined,
        page:     query.page,
        pageSize: query.pageSize,
      }),
    {
      roles: ['doctor'],
      query: t.Object({
        role:     t.Optional(t.Enum(UserRole)),
        page:     t.Optional(t.String()),
        pageSize: t.Optional(t.String()),
      }),
      response: UsersListOutputSchema,
    },
  )
  .post(
    '/create',
    ({ container, body }) => container.get(CreateUserUseCase).execute(body),
    {
      roles:    ['doctor'],
      body:     CreateUserInputSchema,
      response: UserOutputSchema,
    },
  )
  .patch(
    '/:id',
    ({ container, params, body }) =>
      container.get(UpdateUserUseCase).execute({ id: params.id, ...body }),
    {
      roles:    ['doctor'],
      params:   t.Object({ id: t.String() }),
      body:     UpdateUserInputSchema,
      response: UserOutputSchema,
    },
  )
  .post(
    '/:id/deactivate',
    ({ container, params }) =>
      container.get(DeactivateUserUseCase).execute({ id: params.id }),
    {
      roles:    ['doctor'],
      params:   t.Object({ id: t.String() }),
      response: t.Object({ success: t.Boolean() }),
    },
  )
