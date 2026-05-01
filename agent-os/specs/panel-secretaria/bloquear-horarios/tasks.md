# Tasks: Bloquear Horarios

## Task 1 — Guardar documentación ✅

Crear los archivos de spec en `agent-os/specs/panel-secretaria/bloquear-horarios/`.
Actualizar `_index.md` con la nueva fila. Ya completado por el agente de specs.

---

## Task 2 — Schema Zod en entities (frontend) [x]

**Skill:** `/tech-drizzle` (tipos inferidos), `/frontend-architecture` (FSD entities layer)

- Archivo: `apps/web/src/entities/schedule-event/model/schemas.ts`
- Agregar o extender:
  - `blockTypeSchema`: `z.enum(['meeting', 'vacation', 'block'])`
  - `createBlockInputSchema`: `{ date, startTime, endTime, blockType }`
  - `scheduleEventSchema`: campos base (id, date, startTime, endTime, type, doctorId)
- Exportar tipos inferidos: `BlockType`, `CreateBlockInput`, `ScheduleEvent`

> Implementación completada: 2026-04-28

---

## Task 3 — DTO de entrada (backend) [x]

**Skill:** `/backend-architecture`

- Archivo: `apps/api/src/modules/schedule-events/application/dtos/inputs/create-block.input.ts`
- Definir `CreateBlockInput` con: `date: string`, `startTime: string`, `endTime: string`, `blockType: 'meeting' | 'vacation' | 'block'`, `doctorId: string`
- Usar Elysia `t` schema equivalente para validación en ruta

> Implementación completada: 2026-04-28

---

## Task 4 — Use Case: CreateBlockUseCase [x]

**Skill:** `/backend-architecture`, `/tech-drizzle`

- Archivo: `apps/api/src/modules/schedule-events/application/usecases/create-block.usecase.ts`
- `@injectable()`, extends `BaseUseCase<CreateBlockInput, ScheduleEvent[]>`
- `handle()`:
  1. Calcular slots estándar del rango (`startTime`→`endTime` en intervalos de duración de slot del doctor)
  2. Para cada slot: consultar `Appointment` activo con misma fecha y hora → si existe: `throw new AppError('El slot tiene una cita activa, cancélala primero', 409)`
  3. `db.insert(scheduleEvents).values([...])` — uno por slot
  4. Retornar los eventos insertados

> Implementación completada: 2026-04-28

---

## Task 5 — Use Case: DeleteBlockUseCase [x]

**Skill:** `/backend-architecture`, `/tech-drizzle`

- Archivo: `apps/api/src/modules/schedule-events/application/usecases/delete-block.usecase.ts`
- `@injectable()`, extends `BaseUseCase<{ id: string }, void>`
- `handle()`:
  1. Buscar evento por `id` → si no existe: `throw new AppError('Bloqueo no encontrado', 404)`
  2. Verificar que no exista `Appointment` activo en ese slot → si existe: `throw new AppError('Este slot tiene una cita asociada', 409)`
  3. `db.delete(scheduleEvents).where(eq(scheduleEvents.id, id))`

> Implementación completada: 2026-04-28

---

## Task 6 — Rutas POST + DELETE (backend) [x]

**Skill:** `/tech-elysia`, `/backend-architecture`

- Archivo: `apps/api/src/modules/schedule-events/presentation/schedule-events.routes.ts`
- Agregar a las rutas existentes:
  - `POST /schedule-events/block` — llama `CreateBlockUseCase`, requiere auth + rol secretaria/admin
  - `DELETE /schedule-events/:id` — llama `DeleteBlockUseCase`, requiere auth + rol secretaria/admin
- Usar `betterAuthPlugin` + macro de auth como en `users.routes.ts`

> Implementación completada: 2026-04-28

---

## Task 7 — Binding en módulo IoC [x]

**Skill:** `/backend-architecture`

- Archivo: `apps/api/src/modules/schedule-events/schedule-events.module.ts`
- Registrar `CreateBlockUseCase` y `DeleteBlockUseCase` en el contenedor Inversify
- Seguir el patrón de binding existente del módulo

> Implementación completada: 2026-04-28

---

## Task 8 — Componente BloquearHorariosForm (frontend) [x]

**Skill:** `/frontend-design`, `/frontend-architecture`, `/tech-elysia` (Eden Treaty client)

- Archivo: `apps/web/src/features/block-schedule/ui/BloquearHorariosForm.tsx`
- `'use client'`
- `react-hook-form` + `zodResolver(createBlockInputSchema)`
- Campos: `DatePicker`, `TimePicker` (inicio), `TimePicker` (fin), `Select` tipo de bloqueo
- Todos los labels en español: "Fecha", "Hora inicio", "Hora fin", "Tipo de bloqueo"
- Opciones tipo: "Reunión", "Vacaciones", "Bloqueo general"
- Al submit: `clientApi.scheduleEvents.block.post(data)` vía Eden Treaty
- Error 409: mostrar `Alert` con mensaje del servidor
- Éxito: `onSuccess()` callback para refrescar agenda-diaria
- Todos los componentes de `@/components/ui/` (shadcn)

> Implementación completada: 2026-04-28

---

## Task 9 — Public API del feature (frontend) [x]

**Skill:** `/frontend-architecture`

- Archivo: `apps/web/src/features/block-schedule/index.ts`
- Exportar `BloquearHorariosForm`
- Exportar tipos necesarios (reexport desde entities si aplica)

> Implementación completada: 2026-04-28

---

## Task 10 — Integrar en agenda-diaria [x]

**Skill:** `/frontend-architecture`

- En el componente de agenda-diaria (widget o page), agregar:
  - Botón "Bloquear franja" que abre `BloquearHorariosForm` (Dialog/Sheet de shadcn)
  - En slots bloqueados mostrados: botón "Desbloquear" que llama `clientApi.scheduleEvents[id].delete()`
- Refrescar la lista de slots tras cada operación exitosa

> Implementación completada: 2026-04-28
