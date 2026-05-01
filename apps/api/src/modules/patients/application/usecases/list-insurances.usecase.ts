import { injectable } from 'inversify'
import { asc } from 'drizzle-orm'
import type { TxClient } from '@project/db/src/client'
import { MedicalInsurances } from '@project/db/src/schema/medical-insurances.schema'
import { BaseUseCase } from '~/common/base/base-use-case.abstract'
import type { InsuranceOutput } from '../dtos/outputs/insurance.output'

@injectable()
export class ListInsurancesUseCase extends BaseUseCase<void, InsuranceOutput[]> {
  protected async handle(_input: void, tx: TxClient): Promise<InsuranceOutput[]> {
    const rows = await tx.select().from(MedicalInsurances).orderBy(asc(MedicalInsurances.insurerName))
    return rows.map((row) => ({
      id:           row.id,
      insurerName:  row.insurerName,
      coverageType: row.coverageType,
    }))
  }
}
