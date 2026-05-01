import type { TxClient } from '@project/db/src/client'
import { ClinicalConsultation } from "@project/db/src/schema/clinical-consultations.schema";

export abstract class IMedicalRecordsRepository {
  abstract getConsultationsByRecordId(recordId: string, tx: TxClient): Promise<ClinicalConsultation[]>;
  abstract createConsultation(data: any, tx: TxClient): Promise<void>;
}