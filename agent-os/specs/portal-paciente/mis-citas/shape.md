# Mis Citas — Shape

## Scope

Vista de historial de citas del paciente autenticado. Solo lectura.

### In scope
- Listar citas próximas (fecha futura) y pasadas (fecha pasada) del paciente.
- Mostrar datos de `ScheduleEvent` (fecha, hora) y `MedicalAppointment` (motivo, estado).
- Mostrar datos clínicos opcionales (`mainDiagnosis`, `prescribedTreatment`) de `ClinicalConsultation` para citas pasadas.
- Estado vacío con CTA al calendario de disponibilidad.
- Paginación server-side con Server Component.

### Out of scope
- Cancelar o modificar citas (responsabilidad de la secretaria).
- Crear nuevas citas desde esta vista (existe `reservar-cita`).
- Historial clínico detallado (notas, archivos adjuntos).

## Decisiones de diseño

| Decisión | Elección | Razón |
|---|---|---|
| Dónde partir upcoming/past | En el use case (API) | Evita que el cliente reciba datos innecesarios y simplifica la UI. |
| Join con ClinicalConsultation | Left join en repositorio Drizzle | El join es opcional; `null` es un valor válido, no un error. |
| Paginación | `searchParams` en Server Component | Patrón estándar Next.js App Router; no requiere client state. |
| Autenticación | `getSession()` server-side | Consistente con el patrón del proyecto. |
| Estado vacío CTA | Apunta a `/ver-disponibilidad` | MVP: flujo natural hacia reservar una primera cita. |

## Archivos clave

### Frontend
- `apps/web/src/app/(patient)/mis-citas/page.tsx` — thin page
- `apps/web/src/views/mis-citas/ui/MisCitasPage.tsx` — RSC principal
- `apps/web/src/widgets/appointment-list/ui/AppointmentListWidget.tsx` — widget de lista
- `apps/web/src/entities/appointment/model/types.ts` — tipos compartidos

### Backend
- `apps/api/src/modules/appointments/application/usecases/get-my-appointments.usecase.ts`
- `apps/api/src/modules/appointments/application/dtos/outputs/my-appointments.output.ts`

## Standards aplicados
- `frontend/thin-pages` — page.tsx delega a view component.
- `frontend/entity-schemas` — tipos en `entities/appointment/model/`.
- `frontend/fsd-layer-imports` — views → widgets → entities → shared.
- `backend/repository-pattern` — abstract class, `toEntity()`, `$inferSelect`.
