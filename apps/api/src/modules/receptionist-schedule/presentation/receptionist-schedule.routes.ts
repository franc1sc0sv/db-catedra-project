import { t } from "elysia";
import { createRouter } from "~/common/ioc/elysia-base";
import { betterAuthPlugin } from "~/auth-plugin";
import { CreateBlockUseCase } from "../application/usecases/create-block.usecase";
import { DeleteBlockUseCase } from "../application/usecases/delete-block.usecase";
import { GetAvailableSlotsUseCase } from "../application/usecases/get-available-slots.usecase";
import { GetScheduleEventUseCase } from "../application/usecases/get-schedule-event.usecase";
import { CreateBlockInputSchema } from "../application/dtos/inputs/create-block.input";
import { ScheduleEventListOutputSchema } from "../application/dtos/outputs/schedule-event.output";
import { AvailableSlotOutputSchema } from "../application/dtos/outputs/available-slot.output";

export const scheduleEventsRoutes = createRouter({ prefix: "/schedule-events" })
  .use(betterAuthPlugin)
  .post(
    "/block",
    ({ container, body, user }) =>
      container.get(CreateBlockUseCase).execute({ ...body, auditUserId: user.id }),
    {
      roles:    ["receptionist", "doctor"],
      body:     CreateBlockInputSchema,
      response: ScheduleEventListOutputSchema,
    },
  )
  .delete(
    "/:id",
    ({ container, params }) =>
      container.get(DeleteBlockUseCase).execute({ id: params.id }),
    {
      roles:    ["receptionist", "doctor"],
      params:   t.Object({ id: t.String() }),
      response: t.Object({ success: t.Boolean() }),
    },
  )
  .get(
    "/",
    ({ container, query }) =>
      container.get(GetAvailableSlotsUseCase).execute({
        doctorId: query.doctor_id,
        dateFrom: query.date_from,
        dateTo:   query.date_to,
      }),
    {
      query: t.Object({
        doctor_id: t.String({ format: "uuid" }),
        date_from: t.String(),
        date_to:   t.String(),
      }),
      response: t.Array(AvailableSlotOutputSchema),
    },
  )
  .get(
    "/:id",
    ({ container, params }) =>
      container.get(GetScheduleEventUseCase).execute({ id: params.id }),
    {
      params:   t.Object({ id: t.String() }),
      response: AvailableSlotOutputSchema,
    },
  );
