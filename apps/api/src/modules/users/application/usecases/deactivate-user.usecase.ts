import { injectable } from 'inversify'
import type { TxClient } from '@project/db/src/client'
import { BaseUseCase } from '~/common/base/base-use-case.abstract'
import { AppError } from '~/common/errors/app-error'
import { IUsersRepository } from '../../domain/interfaces/users.repository'

interface Input {
  id: string
}

interface Output {
  success: boolean
}

@injectable()
export class DeactivateUserUseCase extends BaseUseCase<Input, Output> {
  constructor(private readonly users: IUsersRepository) { super() }

  protected async handle({ id }: Input, tx: TxClient): Promise<Output> {
    const existing = await this.users.findById(id, tx)
    if (!existing) throw new AppError('User not found', 404)
    await this.users.deactivate(id, tx)
    return { success: true }
  }
}
