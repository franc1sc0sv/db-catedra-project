# Tasks: Configurar Horarios

## Task 1 — Guardar documentación ✅

Crear los archivos de especificación en `agent-os/specs/vista-doctora/configurar-horarios/`.

- [x] `spec.md` — descripción funcional completa
- [x] `tasks.md` — este archivo
- [x] `shape.md` — decisiones de diseño y alcance
- [x] `standards.md` — estándares aplicables
- [x] `references.md` — punteros a código existente
- [x] `sub-specs/.gitkeep`

---

## Task 2 — Entidad frontend: ScheduleEvent schemas ✅

> Implementación completada: 2026-04-28

**Skill:** `/tech-drizzle` (para inferir tipos desde el schema Drizzle existente)

Archivos a crear:
- `apps/web/src/entities/schedule-event/model/schemas.ts` — Zod schema para `GenerateScheduleInput` y `GenerateScheduleOutput`
- `apps/web/src/entities/schedule-event/model/types.ts` — tipos inferidos desde los schemas
- `apps/web/src/entities/schedule-event/index.ts` — re-exports públicos

Pasos:
1. Definir `generateScheduleInputSchema` con campos: `selectedDays` (array de 0–6), `startTime` (HH:mm), `endTime` (HH:mm), `slotDuration` (15|30|45|60), `weekStartDate` (ISO date string).
2. Definir `generateScheduleOutputSchema` con `preview` (array de slots) y `created`/`skipped` (post-confirm).
3. Exportar tipos `GenerateScheduleInput`, `GenerateScheduleOutput`, `ScheduleSlotPreview` desde el index.

---

## Task 3 — DTOs y Use Case en API ✅

> Implementación completada: 2026-04-28

**Skill:** `/backend-architecture`

Archivos a crear/modificar en `apps/api/src/modules/schedule-events/`:
- `application/dtos/inputs/generate-schedule.input.ts`
- `application/dtos/outputs/generate-schedule.output.ts`
- `application/usecases/generate-weekly-schedule.usecase.ts`

Pasos:
1. Crear `GenerateScheduleInput` DTO con validación Elysia/TypeBox: `selectedDays`, `startTime`, `endTime`, `slotDuration`, `weekStartDate`.
2. Crear `GenerateScheduleOutput` DTO: `{ preview: SlotPreview[], created: number, skipped: number }`.
3. Implementar `GenerateWeeklyScheduleUseCase` (`@injectable`, extiende `BaseUseCase`):
   - `handle()` calcula slots con el algoritmo descrito en `spec.md`.
   - Consulta solapamientos con `db.query` antes del INSERT.
   - Usa `db.transaction()` para el bulk INSERT (`/tech-drizzle` migration-transaction-safety).
   - Retorna `{ created, skipped }` tras el INSERT; `preview` se calcula en una función pura separada.
4. Registrar en el módulo existente `schedule-events.module.ts` (binding Inversify). Actualizar `bootstrap.ts` y `app.ts` si el módulo no estaba cargado.

---

## Task 4 — Endpoint API ✅

> Implementación completada: 2026-04-28

**Skill:** `/tech-elysia`

Archivo: `apps/api/src/modules/schedule-events/presentation/schedule-events.routes.ts` (crear o extender)

Pasos:
1. Añadir `POST /schedule-events/preview` — calcula y devuelve slots sin persistir.
2. Añadir `POST /schedule-events/generate` — ejecuta bulk INSERT con overlap detection.
3. Aplicar macro de auth en ambas rutas (solo rol `doctor`).
4. Tipar entrada/salida con los DTOs del Task 3.

---

## Task 5 — Feature frontend: ConfigurarHorariosForm ✅

> Implementación completada: 2026-04-28

**Skills:** `/frontend-design`, `/frontend-architecture`, `/tech-elysia` (Eden Treaty client)

Archivos a crear:
- `apps/web/src/features/schedule-config/ui/ConfigurarHorariosForm.tsx` (`'use client'`)
- `apps/web/src/features/schedule-config/index.ts`

Pasos:
1. Implementar formulario con `react-hook-form` + `zod` (`generateScheduleInputSchema`).
2. Controles shadcn/ui: `Checkbox` por día, `Select` para horas y duración.
3. Al enviar el formulario, llamar `POST /schedule-events/preview` con Eden Treaty desde `apps/web/src/shared/api/client.ts`.
4. Mostrar preview de slots en tabla shadcn `Table`.
5. Botón "Confirmar horario" llama `POST /schedule-events/generate`.
6. Mostrar toast con mensaje _"X horarios creados. Y ignorados por solapamiento."_ usando shadcn `Sonner` o `Toast`.
7. Manejar estados de carga con `useTransition` (`/vercel-react-best-practices` rendering-usetransition-loading).

---

## Task 6 — View y Page ✅

> Implementación completada: 2026-04-28

**Skill:** `/frontend-architecture`

Archivos a crear:
- `apps/web/src/views/configurar-horarios/ui/ConfigurarHorariosPage.tsx` — composición con shadcn `Card`
- `apps/web/src/views/configurar-horarios/index.ts`
- `apps/web/src/app/(doctor)/horarios/page.tsx` — thin page, renderiza `ConfigurarHorariosPage`

Pasos:
1. `ConfigurarHorariosPage` importa `ConfigurarHorariosForm` desde `@/features/schedule-config`.
2. `page.tsx` es Server Component que solo renderiza `ConfigurarHorariosPage`.
3. Proteger la ruta `(doctor)` con middleware de auth que verifique rol `doctor`.
