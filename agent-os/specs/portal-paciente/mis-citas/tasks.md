# Mis Citas — Tasks

## Task 1 ✅ Guardar documentación
Archivos de spec, shape, standards, references y sub-specs creados en `agent-os/specs/portal-paciente/mis-citas/`.

---

## Task 2 — Entidad `appointment` (frontend) ✅
**Skill:** `/tech-drizzle` (tipos inferidos), `/frontend-architecture`

1. Crear `apps/web/src/entities/appointment/model/types.ts` con los tipos `Appointment`, `AppointmentStatus`, `ClinicalData` y la unión `AppointmentWithClinical`.
2. Crear `apps/web/src/entities/appointment/index.ts` re-exportando los tipos públicos.

> Si ya existe de `reservar-cita`, solo agregar los tipos faltantes (`ClinicalData`, `AppointmentWithClinical`).

---

## Task 3 — Use case `GetMyAppointments` (API) ✅
**Skill:** `/tech-drizzle`, `/backend-architecture`

1. Crear `apps/api/src/modules/appointments/application/dtos/outputs/my-appointments.output.ts`:
   - `UpcomingAppointmentDto` — `id`, `eventDate`, `eventTime`, `bookingReason`, `status`.
   - `PastAppointmentDto` — igual + `mainDiagnosis: string | null`, `prescribedTreatment: string | null`.
   - `MyAppointmentsOutputDto` — `{ upcoming: UpcomingAppointmentDto[]; past: PastAppointmentDto[]; total: number; page: number; pageSize: number }`.

2. Crear `apps/api/src/modules/appointments/application/usecases/get-my-appointments.usecase.ts`:
   - Inyectar `IAppointmentRepository` vía Inversify.
   - Llamar `repository.findByPatientDui(patientDui, { page, pageSize })`.
   - Partir resultado por fecha usando `new Date()` como pivote.
   - Retornar `MyAppointmentsOutputDto`.

3. Registrar el use case en el módulo Inversify de `appointments`.

---

## Task 4 — Repositorio: método `findByPatientDui` ✅
**Skill:** `/tech-drizzle`, `/backend-architecture`

1. Agregar `findByPatientDui(patientDui: string, pagination: PaginationInput): Promise<AppointmentWithEvent[]>` a la interfaz abstracta del repositorio.
2. Implementar en `DrizzleAppointmentRepository` usando `db.query.medicalAppointments.findMany`:
   - `where: eq(medicalAppointments.patientDui, patientDui)`
   - `with: { scheduleEvent: true, clinicalConsultation: true }` (left join implícito en Drizzle relational).
   - Aplicar `limit` / `offset` desde `pagination`.
3. `toEntity()` mapea a `AppointmentWithEvent` incluyendo `clinicalData: null` si no existe consulta.

---

## Task 5 — Ruta `GET /appointments/my` ✅
**Skill:** `/tech-elysia`, `/backend-architecture`

1. Agregar ruta autenticada en el plugin de rutas de `appointments`:
   ```
   GET /appointments/my?page=1&pageSize=10
   ```
2. Extraer `patientDui` del contexto de autenticación (Better Auth session).
3. Invocar `GetMyAppointmentsUseCase` y retornar `MyAppointmentsOutputDto`.
4. Validar query params con Elysia `t.Object`.

---

## Task 6 — Widget `AppointmentListWidget` ✅
**Skill:** `/frontend-architecture`, `/next-best-practices`

1. Crear `apps/web/src/widgets/appointment-list/ui/AppointmentListWidget.tsx` como RSC:
   - Acepta props `upcoming: UpcomingAppointmentDto[]` y `past: PastAppointmentDto[]`.
   - Sección "Próximas citas" con `Badge` de estado y datos de fecha/hora/motivo.
   - Sección "Citas pasadas" con datos clínicos condicionales (`mainDiagnosis`, `prescribedTreatment`).
   - Estado vacío global si ambas listas están vacías: mensaje + `Button` CTA hacia `/ver-disponibilidad`.
2. Crear `apps/web/src/widgets/appointment-list/index.ts` re-exportando el widget.

---

## Task 7 — View `MisCitasPage` ✅
**Skill:** `/next-best-practices`, `/frontend-design`

1. Crear `apps/web/src/views/mis-citas/ui/MisCitasPage.tsx` como RSC async:
   - Leer sesión con `getSession()` de `apps/web/src/shared/auth/get-session.server.ts`.
   - Leer `searchParams.page` (default `1`).
   - Llamar `api.appointments.my.get({ query: { page, pageSize: 10 } })` con el Eden Treaty client.
   - Renderizar `<AppointmentListWidget>` con los datos.
2. Crear `apps/web/src/views/mis-citas/index.ts` re-exportando la view.

---

## Task 8 — Thin page ✅
**Skill:** `/next-best-practices`

1. Crear `apps/web/src/app/(patient)/mis-citas/page.tsx`:
   ```tsx
   import { MisCitasPage } from "@/views/mis-citas";
   export default function Page(props) {
     return <MisCitasPage {...props} />;
   }
   ```
2. Verificar que la ruta `(patient)` tenga layout con guard de autenticación para rol `paciente`.

> Implementación completada: 2026-04-28
