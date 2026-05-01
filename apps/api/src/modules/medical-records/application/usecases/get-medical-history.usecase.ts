import { injectable, inject } from "inversify";
import { IMedicalRecordsRepository } from "../../domain/interfaces/medical-records.repository";
import { db } from "@project/db/src/client";

@injectable()
export class GetMedicalHistoryUseCase {
  constructor(
    @inject(IMedicalRecordsRepository)
    private readonly repository: IMedicalRecordsRepository
  ) {}

  async execute(recordId: string) {
    const history = await db.transaction(async (tx) => {
      return await this.repository.getConsultationsByRecordId(recordId, tx);
    });

    return history.sort((a, b) => {
        return b.id.localeCompare(a.id); 
    });
  }
}