import type { Container } from "inversify";
import type { AppModule } from "~/common/ioc/kernel";
import { IReceptionistScheduleRepository } from "./domain/interfaces/receptionist-schedule.repository";
import { DrizzleReceptionistScheduleRepository } from "./infrastructure/repositories/drizzle-receptionist-schedule.repository";
import { GetAvailableSlotsUseCase } from "./application/usecases/get-available-slots.usecase";
import { GetScheduleEventUseCase } from "./application/usecases/get-schedule-event.usecase";
import { CreateBlockUseCase } from "./application/usecases/create-block.usecase";
import { DeleteBlockUseCase } from "./application/usecases/delete-block.usecase";

export class ReceptionistScheduleModule implements AppModule {
  load(container: Container): void {
    container
      .bind(IReceptionistScheduleRepository)
      .to(DrizzleReceptionistScheduleRepository)
      .inRequestScope();
    container.bind(GetAvailableSlotsUseCase).toSelf().inRequestScope();
    container.bind(GetScheduleEventUseCase).toSelf().inRequestScope();
    container.bind(CreateBlockUseCase).toSelf().inRequestScope();
    container.bind(DeleteBlockUseCase).toSelf().inRequestScope();
  }
}
