import { injectable } from 'inversify'
import { eq, desc } from 'drizzle-orm'
import type { TxClient } from '@project/db/src/client'
import { ClinicalConsultations } from '@project/db/src/schema/clinical-consultations.schema'
import { IMedicalRecordsRepository } from '../../domain/interfaces/medical-records.repository'

@injectable()
export class DrizzleMedicalRecordsRepository extends IMedicalRecordsRepository {
  getConsultationsByRecordId = async (recordId: string, tx: TxClient) => {
    return await tx
      .select()
      .from(ClinicalConsultations)
      .where(eq(ClinicalConsultations.recordId, recordId))
      .orderBy(desc(ClinicalConsultations.id));
  }

  createConsultation = async (data: any, tx: TxClient) => {
    await tx.insert(ClinicalConsultations).values(data);
  }
}