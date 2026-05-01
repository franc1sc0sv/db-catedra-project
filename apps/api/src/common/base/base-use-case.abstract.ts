import { db, type TxClient } from '@project/db/src/client'

export abstract class BaseUseCase<TInput, TOutput> {
  protected abstract handle(input: TInput, tx: TxClient): Promise<TOutput>

  async execute(input: TInput): Promise<TOutput> {
    return db.transaction((tx) => this.handle(input, tx))
  }
}
