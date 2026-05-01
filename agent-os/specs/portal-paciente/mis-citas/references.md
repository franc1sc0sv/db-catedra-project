# Mis Citas — References

## Frontend patterns

### View component pattern (shadcn)
`apps/web/src/views/login/ui/LoginPage.tsx`
Ejemplo de view component con Server Component structure y uso de componentes shadcn/ui. Seguir mismo patrón para `MisCitasPage`.

### Eden Treaty client (Server Component fetch)
`apps/web/src/shared/api/client.ts`
Singleton del cliente Eden Treaty. Usar para llamar `api.appointments.my.get(...)` desde el RSC.

### Session server-side
`apps/web/src/shared/auth/get-session.server.ts`
Función `getSession()` para obtener sesión en Server Components. Retorna `null` si no hay sesión activa. Redirigir a login si `null`.

## Backend patterns

### Relational query pattern (Drizzle)
`apps/api/src/modules/users/infrastructure/repositories/drizzle-users.repository.ts`
Patrón completo: clase abstracta, `toEntity()`, query con `db.query.[table].findMany`, uso de `$inferSelect`. Replicar para `DrizzleAppointmentRepository.findByPatientDui`.

### Appointments module (existing)
`apps/api/src/modules/appointments/`
Módulo ya creado para `reservar-cita`. Agregar el use case `GetMyAppointments` y el DTO de output aquí, sin crear un módulo nuevo.

## Database schema (referencia)

Tablas involucradas:
- `medical_appointments` — `id`, `patientDui`, `scheduleEventId`, `bookingReason`, `status`
- `schedule_events` — `id`, `eventDate`, `eventTime`
- `clinical_consultations` — `id`, `appointmentId`, `mainDiagnosis`, `prescribedTreatment`

Join path: `MedicalAppointment → ScheduleEvent` (required), `MedicalAppointment → ClinicalConsultation` (optional/left join).

## Specs relacionadas

- `agent-os/specs/portal-paciente/reservar-cita/` — entidad `appointment` puede estar parcialmente definida aquí.
- `agent-os/specs/portal-paciente/ver-disponibilidad/` — destino del CTA en estado vacío.
