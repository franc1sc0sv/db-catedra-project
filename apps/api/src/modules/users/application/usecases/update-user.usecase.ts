import { injectable } from 'inversify'
import type { TxClient } from '@project/db/src/client'
import { BaseUseCase } from '~/common/base/base-use-case.abstract'
import { AppError } from '~/common/errors/app-error'
import { IUsersRepository } from '../../domain/interfaces/users.repository'
import type { UpdateUserInput } from '../dtos/inputs/update-user.input'
import type { UserOutput } from '../dtos/outputs/user.output'

interface Input extends UpdateUserInput {
  id: string
}

@injectable()
export class UpdateUserUseCase extends BaseUseCase<Input, UserOutput> {
  constructor(private readonly users: IUsersRepository) { super() }

  protected async handle(input: Input, tx: TxClient): Promise<UserOutput> {
    const existing = await this.users.findById(input.id, tx)
    if (!existing) throw new AppError('User not found', 404)

    let user = existing
    if (input.name !== undefined) {
      user = await this.users.updateName(input.id, input.name, tx)
    }
    if (input.role !== undefined) {
      user = await this.users.updateRole(input.id, input.role, tx)
    }

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
