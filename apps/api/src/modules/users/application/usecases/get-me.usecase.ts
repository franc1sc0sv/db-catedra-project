import { injectable } from 'inversify'
import type { TxClient } from '@project/db/src/client'
import { BaseUseCase } from '~/common/base/base-use-case.abstract'
import { AppError } from '~/common/errors/app-error'
import { IUsersRepository } from '../../domain/interfaces/users.repository'
import type { UserOutput } from '../dtos/outputs/user.output'

@injectable()
export class GetMeUseCase extends BaseUseCase<{ id: string }, UserOutput> {
  constructor(private readonly users: IUsersRepository) { super() }

  protected async handle({ id }: { id: string }, tx: TxClient): Promise<UserOutput> {
    const user = await this.users.findById(id, tx)
    if (!user) throw new AppError('User not found', 404)
    return {
      id:            user.id,
      email:         user.email,
      name:          user.name,
      role:          user.role,
      accountStatus: user.accountStatus,
      createdAt:     user.createdAt,
    }
  }
}
