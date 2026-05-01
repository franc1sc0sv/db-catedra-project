# Shape: Reservar Cita

## Alcance

Esta feature cubre exclusivamente el paso de **confirmación** de una cita: el paciente ya eligió el slot en el calendario (ver-disponibilidad) y ahora lo confirma con un motivo de consulta.

No cubre: búsqueda de disponibilidad, cancelación, reprogramación, visualización del historial de citas.

---

## Decisiones de diseño

| Decisión | Elección | Razón |
|---|---|---|
| Atomicidad de los 3 pasos de escritura | `db.transaction()` de Drizzle | Evita estado inconsistente si falla UPDATE o INSERT de WhatsApp |
| Race condition handling | UNIQUE constraint en `MedicalAppointments.eventId` + validación previa | El constraint es el safety net definitivo; la validación previa mejora UX |
| Error propagation | `AppError` lanzado en repositorio/use case, capturado por global handler Elysia | Nunca try/catch en routes ni use cases |
| Redirección por perfil incompleto | `AppError(PROFILE_INCOMPLETE)` → frontend redirige | El backend valida, el frontend navega |
| Estado de loading | `useTransition` (no `useState` manual) | Patrón Vercel React best practices |
| Textos de UI | Todos en español | Constraint del dominio (portal paciente salvadoreño) |
| Imports de shadcn | `@/components/ui/` siempre | Constraint global del proyecto |

---

## Límites de la feature

- **Incluido**: validación de slot, INSERT appointment, UPDATE event status, INSERT WhatsApp message, pantalla de confirmación, manejo de errores de race condition y perfil incompleto.
- **Excluido**: envío real del WhatsApp (solo se inserta el registro en `WhatsAppMessage`; el worker que lo procesa es otra feature), lógica de completar perfil, flujo de cancelación.

---

## Dependencias

| Dependencia | Tipo | Nota |
|---|---|---|
| `ver-disponibilidad` | Upstream feature | Provee el `eventId` preseleccionado |
| `ScheduleEvents` table | DB | Debe existir con campo `availabilityStatus` |
| `Patients` table | DB | Necesaria para validar perfil completo y obtener `patientDui` |
| Better Auth session | Auth | Identifica al paciente autenticado |
| Eden Treaty client | API client | `apps/web/src/shared/api/client.ts` |

---

## Standards aplicados

- `frontend/entity-schemas` — Zod schemas en entities layer
- `frontend/fsd-public-api` — index.ts como único punto de importación
- `frontend/thin-pages` — page.tsx delega en view component
- `backend/use-case-pattern` — `@injectable`, `BaseUseCase`, `handle()`
- `backend/repository-pattern` — abstract class token, `toEntity()`, `TxClient`
- `backend/error-handling` — `AppError` nunca try/catch en routes
