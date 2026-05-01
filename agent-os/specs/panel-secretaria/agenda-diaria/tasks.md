# Tasks: Agenda Diaria (Secretaria)

## Task 1 — Guardar documentación ✅
Archivos de spec creados en `agent-os/specs/panel-secretaria/agenda-diaria/`.

---

## Task 2 — Output DTO del use case receptionist [x]
**Skill:** `/backend-architecture`

1. Crear `apps/api/src/modules/agenda/application/dtos/outputs/receptionist-agenda-item.output.ts`.
   - Campos: `slotId`, `startTime`, `endTime`, `availabilityStatus`, `patientName`, `bookingReason`, `whatsappPhone`, `appointmentId`.
2. Exportar desde el barrel del módulo agenda.

> Implementación completada: 2026-04-28

---

## Task 3 — Use case GetDailyAgendaReceptionist [x]
**Skill:** `/backend-architecture`

1. Crear `apps/api/src/modules/agenda/application/usecases/get-daily-agenda-receptionist.usecase.ts`.
   - Parámetro: `fecha: string` (YYYY-MM-DD).
   - Inyectar `IAgendaRepository` (token abstracto existente o nuevo).
   - Llamar al repositorio → mapear a `ReceptionistAgendaItemOutput[]`.
2. Registrar el use case en el módulo Inversify de agenda.

> Implementación completada: 2026-04-28

---

## Task 4 — Repositorio: query DailyScheduleView por fecha [x]
**Skill:** `/tech-drizzle`

1. En `apps/api/src/modules/agenda/infrastructure/repositories/drizzle-agenda.repository.ts`:
   - Añadir método `getDailyAgendaForReceptionist(fecha: string, tx: TxClient): Promise<IAgendaSlot[]>`.
   - Query `tx.select().from(DailyScheduleView).where(eq(DailyScheduleView.eventDate, fecha)).orderBy(asc(DailyScheduleView.startTime))`.
   - Usar `$inferSelect` del view para tipado seguro.
2. Actualizar la interfaz abstracta `IAgendaRepository`.

> Implementación completada: 2026-04-28

---

## Task 5 — Ruta API GET /agenda [x]
**Skill:** `/tech-elysia`

1. En `apps/api/src/modules/agenda/presentation/agenda.routes.ts`:
   - Añadir `GET /agenda` con query param `fecha` (string, formato YYYY-MM-DD, default hoy).
   - Aplicar macro de autenticación + verificación de rol receptionist/admin.
   - Resolver `GetDailyAgendaReceptionistUseCase` desde el contenedor Inversify.
   - Retornar `ReceptionistAgendaItemOutput[]`.

> Implementación completada: 2026-04-28

---

## Task 6 — Widget AgendaTable [x]
**Skill:** `/frontend-architecture`, `/tailwind-css-patterns`, `/frontend-design`

1. Crear `apps/web/src/widgets/agenda-table/ui/AgendaTableWidget.tsx`.
   - Props: `items: AgendaItem[]`, `fecha: string`.
   - Si `items.length === 0` → mostrar mensaje "No hay agenda configurada para esta fecha."
   - Si hay items → renderizar tabla shadcn (`Table`, `TableHeader`, `TableRow`, `TableCell`) con:
     - Columnas: Hora, Estado (badge), Paciente, Motivo, WhatsApp, Acciones.
     - Variante de color por fila según `availabilityStatus`.
2. Crear `apps/web/src/widgets/agenda-table/index.ts` (barrel).

> Implementación completada: 2026-04-28

---

## Task 7 — Navegación de fecha [x]
**Skill:** `/next-best-practices`

1. Crear `apps/web/src/widgets/agenda-table/ui/DateNav.tsx` (Client Component).
   - Recibe `fecha: string` (YYYY-MM-DD).
   - Botones prev/next actualizan `?fecha=` via `useRouter().push`.
   - Date picker con `<input type="date">`.

> Implementación completada: 2026-04-28

---

## Task 8 — Vista AgendaSecretariaPage (RSC) [x]
**Skill:** `/frontend-architecture`, `/next-best-practices`

1. Crear `apps/web/src/views/agenda-secretaria/ui/AgendaSecretariaPage.tsx`.
   - RSC. Recibe `{ fecha: string }`.
   - Llama `api.agenda.get({ query: { fecha } })` con Eden Treaty.
   - Renderiza `<DateNav fecha={fecha} />` + `<AgendaTableWidget items={data} fecha={fecha} />`.
2. Crear `apps/web/src/views/agenda-secretaria/index.ts` (barrel).

> Implementación completada: 2026-04-28

---

## Task 9 — Thin page Next.js [x]
**Skill:** `/next-best-practices`

1. Crear `apps/web/src/app/(receptionist)/agenda/page.tsx`.
   - Parsear `searchParams.fecha` (awaited, Next.js 15+).
   - Si ausente, usar `new Date().toISOString().slice(0, 10)`.
   - Renderizar `<AgendaSecretariaPage fecha={fecha} />`.
2. Crear `apps/web/src/app/(receptionist)/layout.tsx` con `requireRole([UserRole.Receptionist, UserRole.Admin])`.

> Implementación completada: 2026-04-28
