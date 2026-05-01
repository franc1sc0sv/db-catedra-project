import { injectable } from 'inversify'
import { sql } from 'drizzle-orm'
import type { TxClient } from '@project/db/src/client'
import { BaseUseCase } from '~/common/base/base-use-case.abstract'
import type { HealthOutput } from '../dtos/outputs/health.output'

@injectable()
export class HealthCheckUseCase extends BaseUseCase<void, HealthOutput> {
  protected async handle(_: void, tx: TxClient): Promise<HealthOutput> {
    let database = 'up'
    try {
      await tx.execute(sql`SELECT 1`)
    } catch {
      database = 'down'
    }

    return {
      status:    database === 'up' ? 'ok' : 'degraded',
      database,
      uptime:    process.uptime(),
      timestamp: new Date().toISOString(),
    }
  }
}
