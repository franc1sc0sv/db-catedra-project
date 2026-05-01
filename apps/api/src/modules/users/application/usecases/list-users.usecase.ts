import { injectable } from 'inversify'
import type { TxClient } from '@project/db/src/client'
import type { UserRole } from '@project/enums/src/user-role.enum'
import { BaseUseCase } from '~/common/base/base-use-case.abstract'
import { IUsersRepository } from '../../domain/interfaces/users.repository'
import type { UsersListOutput } from '../dtos/outputs/user.output'

interface Input {
  role?:     UserRole
  page?:     string | number
  pageSize?: string | number
}

function toPositiveInt(value: unknown, fallback: number): number {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback
}

@injectable()
export class ListUsersUseCase extends BaseUseCase<Input, UsersListOutput> {
  constructor(private readonly users: IUsersRepository) { super() }

  protected async handle(input: Input, tx: TxClient): Promise<UsersListOutput> {
    const page     = toPositiveInt(input.page, 1)
    const pageSize = toPositiveInt(input.pageSize, 20)
    const { items, total } = await this.users.list({ role: input.role, page, pageSize }, tx)
    return {
      items: items.map((user) => ({
        id:            user.id,
        email:         user.email,
        name:          user.name,
        role:          user.role,
        accountStatus: user.accountStatus,
        createdAt:     user.createdAt,
      })),
      total,
      page,
      pageSize,
    }
  }
}
