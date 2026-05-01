import type { Container } from 'inversify'
import type { AppModule } from '~/common/ioc/kernel'
import { IUsersRepository }            from './domain/interfaces/users.repository'
import { DrizzleUsersRepository }      from './infrastructure/repositories/drizzle-users.repository'
import { GetMeUseCase }                from './application/usecases/get-me.usecase'
import { ListUsersUseCase }            from './application/usecases/list-users.usecase'
import { ListActiveDoctorsUseCase }    from './application/usecases/list-active-doctors.usecase'
import { CreateUserUseCase }           from './application/usecases/create-user.usecase'
import { UpdateUserUseCase }           from './application/usecases/update-user.usecase'
import { DeactivateUserUseCase }       from './application/usecases/deactivate-user.usecase'

export class UsersModule implements AppModule {
  load(container: Container): void {
    container.bind(IUsersRepository).to(DrizzleUsersRepository).inRequestScope()
    container.bind(GetMeUseCase).toSelf().inRequestScope()
    container.bind(ListUsersUseCase).toSelf().inRequestScope()
    container.bind(ListActiveDoctorsUseCase).toSelf().inRequestScope()
    container.bind(CreateUserUseCase).toSelf().inRequestScope()
    container.bind(UpdateUserUseCase).toSelf().inRequestScope()
    container.bind(DeactivateUserUseCase).toSelf().inRequestScope()
  }
}
