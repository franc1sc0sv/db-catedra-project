# Procedimientos Almacenados — Tasks

## Task 1 ✅ Guardar documentación
Archivos de spec creados en `agent-os/specs/capa-datos/procedimientos-almacenados/`.

---

## Task 2: Crear archivo SQL con los cuatro stored procedures ✅
**Skill:** `/tech-drizzle`

Crear `packages/db/src/stored-procedures.sql` con las definiciones completas de:
- [x] `sp_get_available_slots(p_date DATE)` — RETURNS TABLE
- [x] `sp_cancel_appointment(p_appointment_id UUID, p_cancelled_by UUID)` — CALL, transaccional
- [x] `sp_complete_consultation(p_appointment_id UUID, ...)` — CALL, atómico
- [x] `sp_get_patient_history(p_dui VARCHAR)` — RETURNS TABLE

Cada SP debe incluir `CREATE OR REPLACE`. Los procedimientos escritura deben usar bloques `BEGIN … EXCEPTION WHEN OTHERS THEN RAISE;` para propagación correcta.

**Archivo:** `packages/db/src/stored-procedures.sql`

> Implementación completada: 2026-04-28

---

## Task 3: Crear módulo `appointments` en apps/api
**Skill:** `/backend-architecture`

Scaffold del módulo siguiendo el patrón del módulo `users`:

```
apps/api/src/modules/appointments/
  appointments.module.ts
  domain/
    entities/appointment.entity.ts
    interfaces/appointments.repository.ts
  application/
    usecases/get-available-slots.usecase.ts
    usecases/cancel-appointment.usecase.ts
    usecases/complete-consultation.usecase.ts
    usecases/get-patient-history.usecase.ts
    dtos/outputs/available-slot.output.ts
    dtos/outputs/patient-history.output.ts
  infrastructure/
    repositories/drizzle-appointments.repository.ts
  presentation/
    appointments.routes.ts
```

---

## Task 4: Implementar `get-available-slots.usecase.ts`
**Skill:** `/backend-architecture` + `/tech-drizzle`

- Extiende `BaseUseCase<{ date: string }, AvailableSlotOutput[]>`
- El repositorio ejecuta: `db.execute(sql\`SELECT * FROM sp_get_available_slots(${date})\`)`
- Mapea filas a `AvailableSlotOutput[]`
- Decorar con `@injectable()`

**Archivo:** `apps/api/src/modules/appointments/application/usecases/get-available-slots.usecase.ts`

---

## Task 5: Implementar `cancel-appointment.usecase.ts`
**Skill:** `/backend-architecture` + `/tech-drizzle`

- Extiende `BaseUseCase<{ appointmentId: string; cancelledBy: string }, void>`
- El repositorio ejecuta: `db.execute(sql\`CALL sp_cancel_appointment(${appointmentId}, ${cancelledBy})\`)`
- Si PostgreSQL lanza excepción (cita completada), Drizzle la propaga; el use case NO hace try/catch — el error llega al handler global como 500 o se convierte en `AppError` en el repositorio
- Decorar con `@injectable()`

**Archivo:** `apps/api/src/modules/appointments/application/usecases/cancel-appointment.usecase.ts`

---

## Task 6: Implementar `complete-consultation.usecase.ts`
**Skill:** `/backend-architecture` + `/tech-drizzle`

- Extiende `BaseUseCase<CompleteConsultationInput, void>`
- Input incluye: `appointmentId`, `symptoms`, `bp`, `weight`, `diagnosis`, `treatment`, `notes`
- El repositorio ejecuta: `db.execute(sql\`CALL sp_complete_consultation(${...params})\`)`
- Decorar con `@injectable()`

**Archivo:** `apps/api/src/modules/appointments/application/usecases/complete-consultation.usecase.ts`

---

## Task 7: Implementar `get-patient-history.usecase.ts`
**Skill:** `/backend-architecture` + `/tech-drizzle`

- Extiende `BaseUseCase<{ dui: string }, PatientHistoryOutput[]>`
- El repositorio ejecuta: `db.execute(sql\`SELECT * FROM sp_get_patient_history(${dui})\`)`
- Decorar con `@injectable()`

**Archivo:** `apps/api/src/modules/appointments/application/usecases/get-patient-history.usecase.ts`

---

## Task 8: Implementar `drizzle-appointments.repository.ts`
**Skill:** `/tech-drizzle` + `/backend-architecture`

- Extiende `IAppointmentsRepository`
- Todos los métodos reciben `tx: TxClient` como último argumento
- Usa `$inferSelect` para tipar filas crudas
- Método privado `toEntity(row)` para cada entidad

**Archivo:** `apps/api/src/modules/appointments/infrastructure/repositories/drizzle-appointments.repository.ts`

---

## Task 9: Registrar módulo en bootstrap y montar rutas
**Skill:** `/backend-architecture`

Dos pasos manuales:
1. `apps/api/src/common/ioc/bootstrap.ts` — agregar `new AppointmentsModule().load(container)`
2. `apps/api/src/app.ts` — montar `appointmentsRoutes` con el prefijo `/appointments`

**Archivos:**
- `apps/api/src/common/ioc/bootstrap.ts`
- `apps/api/src/app.ts`

---

## Task 10: Crear rutas de presentación
**Skill:** `/tech-elysia` + `/backend-architecture`

Crear `appointments.routes.ts` con:
- `GET /appointments/slots?date=YYYY-MM-DD` → `GetAvailableSlotsUseCase`
- `POST /appointments/:id/cancel` → `CancelAppointmentUseCase`
- `POST /appointments/:id/complete` → `CompleteConsultationUseCase`
- `GET /patients/:dui/history` → `GetPatientHistoryUseCase`

Usar patrón `createRouter` + `container.get(UseCase).execute()`. No try/catch en rutas.

**Archivo:** `apps/api/src/modules/appointments/presentation/appointments.routes.ts`
