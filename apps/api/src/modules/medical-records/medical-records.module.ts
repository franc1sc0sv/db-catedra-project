import type { Container } from "inversify";
import type { AppModule } from "~/common/ioc/kernel";
import { IMedicalRecordsRepository } from "./domain/interfaces/medical-records.repository";
import { DrizzleMedicalRecordsRepository } from "./infrastructure/repositories/drizzle-medical-records.repository";
import { GetMedicalHistoryUseCase } from "./application/usecases/get-medical-history.usecase";

export class MedicalRecordsModule implements AppModule {
  load(container: Container): void {
    container
      .bind(IMedicalRecordsRepository)
      .to(DrizzleMedicalRecordsRepository)
      .inRequestScope();

    container.bind(GetMedicalHistoryUseCase).toSelf().inRequestScope();
  }
}