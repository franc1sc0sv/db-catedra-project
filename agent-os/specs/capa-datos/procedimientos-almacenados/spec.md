# Procedimientos Almacenados — Spec

## Descripción general

Este módulo define cuatro stored procedures PostgreSQL que encapsulan operaciones de negocio críticas del sistema de citas médicas. Al centralizar la lógica en la base de datos se garantiza atomicidad independientemente de la capa de aplicación que invoque el procedimiento, y se simplifica la implementación de los use cases en `apps/api`.

## Los cuatro procedimientos

### `sp_get_available_slots(p_date DATE)`
Procedimiento de solo lectura. Devuelve los `ScheduleEvents` disponibles para una fecha dada: `id`, `eventDate`, `startTime`, `endTime`. No modifica estado; se invoca con `SELECT * FROM sp_get_available_slots($1)` (función RETURNS TABLE).

### `sp_cancel_appointment(p_appointment_id UUID, p_cancelled_by UUID)`
Procedimiento transaccional de escritura. Pasos en orden:
1. Verifica que la cita no esté en estado `completed`; si lo está, lanza `RAISE EXCEPTION` y hace rollback completo.
2. Actualiza `ScheduleEvent` a estado `cancelled` y registra `auditUserId`.
3. Inserta un registro en `WhatsAppMessage` de tipo `cancellation`.

Si cualquier paso falla, el bloque `BEGIN/EXCEPTION/END` revierte todo.

### `sp_complete_consultation(p_appointment_id UUID, p_symptoms TEXT, p_bp VARCHAR, p_weight NUMERIC, p_diagnosis TEXT, p_treatment TEXT, p_notes TEXT)`
Procedimiento atómico de escritura. Pasos en orden:
1. Resuelve la cadena `MedicalAppointments → Patients → MedicalRecords` para obtener `recordId`.
2. Inserta un registro en `ClinicalConsultations` con los parámetros clínicos.
3. Actualiza `ScheduleEvent` a estado `completed`.

Los tres pasos ocurren todos o ninguno.

### `sp_get_patient_history(p_dui VARCHAR)`
Procedimiento de solo lectura. Combina los datos de `PatientFullRecordView` con todas las `ClinicalConsultations` del paciente, ordenadas por fecha descendente. Se invoca con `SELECT * FROM sp_get_patient_history($1)`.

## Implementación

Los procedimientos se definen en un archivo SQL dedicado:
```
packages/db/src/stored-procedures.sql
```

La migración se aplica con `psql` o como parte del seed/migration script. Los use cases de `apps/api` los invocan desde repositorios Drizzle:

```ts
// Función RETURNS TABLE
const slots = await db.execute(sql`SELECT * FROM sp_get_available_slots(${date})`);

// CALL para procedimientos void
await db.execute(sql`CALL sp_cancel_appointment(${appointmentId}, ${cancelledBy})`);
```

## Por qué atomicidad en la base de datos

- Los use cases orquestan lógica de negocio pero no necesitan abrir transacciones explícitas para estas operaciones: el SP es la transacción.
- Cualquier cliente (API REST, scripts administrativos, herramientas de soporte) obtiene la misma semántica transaccional.
- Los errores de negocio se convierten en excepciones PostgreSQL que Drizzle propaga como errores de JS, compatibles con el patrón `AppError` del backend.
