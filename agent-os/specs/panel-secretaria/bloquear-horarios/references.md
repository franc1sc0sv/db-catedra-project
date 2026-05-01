# References: Bloquear Horarios

## Frontend — Client Component pattern

`apps/web/src/features/auth/ui/LoginForm.tsx`
Patrón de Client Component con `react-hook-form` + `zodResolver` + shadcn components. Replicar estructura para `BloquearHorariosForm`.

## Frontend — View composition

`apps/web/src/views/login/ui/LoginPage.tsx`
Cómo una vista compone features. Referencia para integrar `BloquearHorariosForm` en la vista de agenda-diaria.

## Frontend — API client para mutaciones

`apps/web/src/shared/api/client.ts`
`clientApi` via Eden Treaty. Usar para llamadas `POST /schedule-events/block` y `DELETE /schedule-events/:id` desde Client Components.

## Backend — BaseUseCase pattern

`apps/api/src/modules/users/application/usecases/get-me.usecase.ts`
Implementación de referencia: `@injectable()`, `BaseUseCase<TInput, TOutput>`, `handle()`.

## Backend — Rutas con auth

`apps/api/src/modules/users/presentation/users.routes.ts`
Uso de `betterAuthPlugin` + macro de autenticación. Replicar para las nuevas rutas de schedule-events.

## Backend — Módulo schedule-events existente

`apps/api/src/modules/schedule-events/`
Módulo donde se agregan los nuevos use cases y rutas. Revisar estructura existente antes de añadir archivos (especialmente `schedule-events.module.ts` para bindings Inversify).

## Entidad schedule-event (si existe)

`apps/web/src/entities/schedule-event/model/schemas.ts`
Si ya existe desde `ver-disponibilidad`: extender con `blockTypeSchema` y `createBlockInputSchema`. Si no existe: crear desde cero siguiendo el patrón de FSD entities.
