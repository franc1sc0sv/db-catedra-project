# Agenda de Hoy — Tasks

## Task 1 — Guardar documentación ✅

Archivos de spec creados en `agent-os/specs/vista-doctora/agenda-hoy/`.

---

## Task 2 — Definir entidad y DTO de salida ✅

> Implementación completada: 2026-04-28

**Skill:** `/backend-architecture`

Pasos:
1. Crear `apps/api/src/modules/agenda/domain/entities/agenda-item.entity.ts`
   - Campos: `slotId`, `startTime`, `endTime`, `patientId?`, `patientName?`, `bookingReason?`, `status`, `mainDiagnosis?`
2. Crear `apps/api/src/modules/agenda/application/dtos/outputs/agenda-item.output.ts`
   - DTO plano con los mismos campos; `startTime`/`endTime` como `string` ISO.
3. Exportar desde `apps/api/src/modules/agenda/` (barrel mínimo).

---

## Task 3 — Interfaz de repositorio ✅

> Implementación completada: 2026-04-28

**Skill:** `/backend-architecture`

Pasos:
1. Crear `apps/api/src/modules/agenda/domain/interfaces/agenda.repository.ts`
   - Abstract class `AgendaRepository` con método `getDailyAgenda(fecha: string): Promise<AgendaItem[]>`
2. Registrar token `AGENDA_REPOSITORY` en `apps/api/src/modules/agenda/agenda.module.ts`.

---

## Task 4 — Implementación Drizzle del repositorio ✅

> Implementación completada: 2026-04-28

**Skill:** `/tech-drizzle`

Pasos:
1. Crear `apps/api/src/modules/agenda/infrastructure/repositories/drizzle-agenda.repository.ts`
   - Implementa `AgendaRepository`.
   - Usa `db.select({ ... })` sobre `DailyScheduleView` filtrando `sql\`DATE(${view.startTime}) = ${fecha}\`` y ordenando por `startTime ASC`.
   - Solo selecciona columnas necesarias (regla `rqb-select-columns`).
   - Método `toEntity()` privado: mapea `$inferSelect` de la vista a `AgendaItem`.
2. Tipar la fila de la vista con la interfaz manual o `typeof dailyScheduleView.$inferSelect` según disponibilidad en Drizzle.

---

## Task 5 — Caso de uso ✅

> Implementación completada: 2026-04-28

**Skill:** `/backend-architecture`

Pasos:
1. Crear `apps/api/src/modules/agenda/application/usecases/get-daily-agenda.usecase.ts`
   - Inyecta `AgendaRepository`.
   - Valida formato `YYYY-MM-DD`; lanza `AppError` 400 si inválido.
   - Devuelve `AgendaItemOutput[]` mapeados desde entidades.
2. Registrar caso de uso en `agenda.module.ts`.

---

## Task 6 — Ruta Elysia ✅

> Implementación completada: 2026-04-28

**Skill:** `/tech-elysia`

Pasos:
1. Crear `apps/api/src/modules/agenda/presentation/agenda.routes.ts`
   - `GET /agenda` con query param `fecha: t.String({ pattern: '^\\d{4}-\\d{2}-\\d{2}$' })`.
   - Macro de autenticación que exige rol `doctora` (patrón de `references/error-handling.md`).
   - Invoca `GetDailyAgendaUseCase.execute(fecha)`.
2. Registrar el plugin en `apps/api/src/app.ts` y bindings en `apps/api/src/bootstrap.ts`.

---

## Task 7 — Thin page Next.js ✅

> Implementación completada: 2026-04-28

**Skill:** `/next-best-practices`, `/frontend-architecture`

Pasos:
1. Crear `apps/web/src/app/(doctor)/agenda/page.tsx`
   - `async` Server Component.
   - Lee `searchParams.fecha`; si ausente usa `new Date().toISOString().slice(0, 10)`.
   - Renderiza `<AgendaDoctorPage fecha={fecha} />`.
   - Exportar `export const revalidate = 30`.

---

## Task 8 — View component AgendaDoctorPage ✅

> Implementación completada: 2026-04-28

**Skill:** `/frontend-architecture`, `/next-best-practices`

Pasos:
1. Crear `apps/web/src/views/agenda-doctora/ui/AgendaDoctorPage.tsx`
   - RSC que llama al cliente Eden Treaty (`api.agenda.get({ query: { fecha } })`).
   - Aplica guard de servidor: si no hay sesión o rol !== `doctora`, redirige.
   - Pasa los datos a `<AgendaTimelineWidget items={items} fecha={fecha} />`.
2. Crear `apps/web/src/views/agenda-doctora/index.ts` — re-exporta el componente.

---

## Task 9 — Widget AgendaTimelineWidget ✅

> Implementación completada: 2026-04-28

**Skill:** `/frontend-design`, `/tailwind-css-patterns`

Pasos:
1. Crear `apps/web/src/widgets/agenda-timeline/ui/AgendaTimelineWidget.tsx`
   - Props: `items: AgendaItemOutput[]`, `fecha: string`.
   - Renderiza un timeline vertical: cada slot como tarjeta con franja lateral coloreada por `status`.
     - `disponible` → gris claro
     - `reservado` → azul
     - `completado` → verde
     - `cancelado` → rojo tenue
   - Slot libre: texto "Cupo disponible" en itálica.
   - Consulta completada: muestra `mainDiagnosis` en párrafo secundario.
   - Controles de fecha: botones `← Anterior` / `Siguiente →` que generan `<Link href={?fecha=...}>`.
   - Todos los textos en español.
   - Solo componentes de `@/components/ui/` (Badge, Card, Button, etc.).
2. Crear `apps/web/src/widgets/agenda-timeline/index.ts` — re-exporta el widget.

---

## Task 10 — Verificación de flujo completo

Pasos:
1. Arrancar `apps/api` y `apps/web`.
2. Navegar a `/agenda` como doctora autenticada; verificar que se muestra la agenda del día actual.
3. Navegar a `/agenda?fecha=YYYY-MM-DD` con fecha futura; verificar que cambian los slots.
4. Verificar que un rol distinto (paciente/admin) recibe redirección.
5. Confirmar que tras 30 s, un nuevo booking aparece sin recarga manual.
