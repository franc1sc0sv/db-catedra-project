# Tasks: Ver Disponibilidad

## Task 1 — Guardar documentación ✅

Archivar este spec en `agent-os/specs/portal-paciente/ver-disponibilidad/`. Archivos creados: `spec.md`, `tasks.md`, `shape.md`, `standards.md`, `references.md`, `sub-specs/.gitkeep`.

---

## Task 2 — Entidad y tipos frontend ✅

**Skill:** `/tech-drizzle`

- Crear `apps/web/src/entities/schedule-event/model/types.ts` con la interfaz `ScheduleEvent` (id, startTime: Date, endTime: Date, doctorName?, specialty?).
- Crear `apps/web/src/entities/schedule-event/index.ts` exportando `ScheduleEvent`.

---

## Task 3 — Backend: entidad de dominio ✅

**Skill:** `/backend-architecture`

- Crear `apps/api/src/modules/schedule-events/domain/entities/schedule-event.entity.ts`.
- Campos mínimos: `id`, `eventType`, `availabilityStatus`, `startTime`, `endTime`, `doctorId`.

---

## Task 4 — Backend: interfaz de repositorio ✅

**Skill:** `/backend-architecture`

- Crear `apps/api/src/modules/schedule-events/domain/interfaces/schedule-events.repository.ts`.
- Método: `findAvailable(dateFrom: Date, dateTo: Date): Promise<ScheduleEventEntity[]>`.
- Abstract class token `IScheduleEventsRepository`.

---

## Task 5 — Backend: output DTO ✅

**Skill:** `/backend-architecture`

- Crear `apps/api/src/modules/schedule-events/application/dtos/outputs/available-slot.output.ts`.
- Campos: `id`, `startTime`, `endTime`, `doctorName?`, `specialty?` (todos `string`).

---

## Task 6 — Backend: use case ✅

**Skill:** `/backend-architecture`

- Crear `apps/api/src/modules/schedule-events/application/usecases/get-available-slots.usecase.ts`.
- `@injectable()`, extiende `BaseUseCase<{ dateFrom: Date; dateTo: Date }, AvailableSlotOutput[]>`.
- Inyecta `IScheduleEventsRepository`. Mapea entidades a DTOs.

---

## Task 7 — Backend: repositorio Drizzle ✅

**Skill:** `/tech-drizzle`

- Crear `apps/api/src/modules/schedule-events/infrastructure/repositories/drizzle-schedule-events.repository.ts`.
- Implementa `IScheduleEventsRepository`.
- Query con `db.select()` filtrando `eventType = 'appointment'`, `availabilityStatus = 'available'`, `startTime >= dateFrom`, `startTime < dateTo`.
- Usar `$inferSelect` para el tipo de fila. Método `toEntity()` para mapear.

---

## Task 8 — Backend: rutas Elysia ✅

**Skill:** `/tech-elysia`

- Crear `apps/api/src/modules/schedule-events/presentation/schedule-events.routes.ts`.
- `GET /schedule-events` con query params `date_from: t.String()` y `date_to: t.String()`.
- Sin middleware de auth (endpoint público).
- Convierte strings a `Date`, llama al use case, retorna array de `AvailableSlotOutput`.

---

## Task 9 — Backend: módulo e inyección ✅

**Skill:** `/backend-architecture`

- Crear `apps/api/src/modules/schedule-events/schedule-events.module.ts`.
- Registrar binding `IScheduleEventsRepository → DrizzleScheduleEventsRepository`.
- Registrar `GetAvailableSlotsUseCase`.
- Importar módulo en `bootstrap.ts` y montar rutas en `app.ts`.

---

## Task 10 — Widget: CalendarioDisponibilidadWidget ✅

**Skills:** `/frontend-design`, `/tailwind-css-patterns`, `/next-best-practices`

- Crear `apps/web/src/widgets/calendario-disponibilidad/ui/CalendarioDisponibilidadWidget.tsx`.
- Props: `slots: ScheduleEvent[]`, `currentWeek: string` (formato `YYYY-WW`).
- Renderiza grid semanal: columnas = días (lun–dom), celdas = slots con hora inicio/fin.
- Botones "Semana anterior" y "Semana siguiente" como `<Link>` hacia `?week=YYYY-WW`.
- Estado vacío: banner "No hay horarios disponibles esta semana".
- Cada celda llama a `onSlotClick(slot)` (prop).
- Componente marcado `'use client'` para manejar el click y consultar sesión.
- Crear `apps/web/src/widgets/calendario-disponibilidad/index.ts` con re-export.

---

## Task 11 — View: DisponibilidadPage (RSC) ✅

**Skills:** `/next-best-practices`, `/frontend-design`

- Crear `apps/web/src/views/disponibilidad/ui/DisponibilidadPage.tsx`.
- Leer `searchParams.week`; si ausente usar semana actual.
- Calcular `dateFrom` / `dateTo` del rango semanal.
- Llamar `api.scheduleEvents.get({ query: { date_from, date_to } })` con cliente Eden Treaty servidor.
- Mapear respuesta a `ScheduleEvent[]`.
- Renderizar `CalendarioDisponibilidadWidget`.
- Manejar el `onSlotClick`: lógica de auth-redirect (Dialog shadcn/ui si no autenticado, push a `/reservar-cita?slotId=` si autenticado).
- Crear `apps/web/src/views/disponibilidad/index.ts` con re-export.

---

## Task 12 — Thin page route ✅

**Skill:** `/next-best-practices`

- Crear `apps/web/src/app/disponibilidad/page.tsx`.
- Recibe `searchParams` como prop async (Next.js 15+).
- Pasa `week` a `DisponibilidadPage`.
- No contiene lógica de negocio.

---

## Task 13 — Verificación

- `GET /schedule-events?date_from=2026-04-28T00:00:00Z&date_to=2026-05-05T00:00:00Z` retorna array JSON.
- `/disponibilidad` carga sin error en el browser.
- Navegación semanal cambia URL y re-ejecuta fetch RSC.
- Click en slot sin sesión muestra Dialog con "Inicia sesión para reservar".
- Click en slot con sesión redirige a `/reservar-cita?slotId=<id>`.

> Implementación completada: 2026-04-28
