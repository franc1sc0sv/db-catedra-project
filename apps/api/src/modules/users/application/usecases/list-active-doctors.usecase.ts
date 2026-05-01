import { injectable } from 'inversify'
import type { TxClient } from '@project/db/src/client'
import { BaseUseCase } from '~/common/base/base-use-case.abstract'
import { IUsersRepository } from '../../domain/interfaces/users.repository'
import type { DoctorRefOutput } from '../dtos/outputs/user.output'

@injectable()
export class ListActiveDoctorsUseCase extends BaseUseCase<void, DoctorRefOutput[]> {
  constructor(private readonly users: IUsersRepository) { super() }

  protected async handle(_input: void, tx: TxClient): Promise<DoctorRefOutput[]> {
    return this.users.listActiveDoctors(tx)
  }
}
