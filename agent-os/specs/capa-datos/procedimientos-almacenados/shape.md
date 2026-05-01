# Procedimientos Almacenados — Shape

## Scope

Este feature cubre exclusivamente la capa de base de datos (stored procedures SQL) y la capa de API que los invoca (use cases + repositorios Drizzle). No incluye UI.

**Incluye:**
- `packages/db/src/stored-procedures.sql` — definiciones SQL
- `apps/api/src/modules/appointments/` — módulo completo con 4 use cases
- Registro en `bootstrap.ts` y `app.ts`

**Excluye:**
- Vistas (`PatientFullRecordView`) — definidas en otro spec de capa-datos
- Tablas base (`ScheduleEvent`, `MedicalAppointments`, etc.) — schema existente
- Frontend / cliente Eden Treaty

## Decisiones de diseño

### SQL vs transacciones a nivel de aplicación
Se eligió implementar la lógica transaccional en stored procedures PostgreSQL en lugar de orquestar múltiples queries desde el use case. Razones:
- `BaseUseCase.execute()` ya envuelve en transacción Drizzle, pero los SPs de escritura necesitan lógica condicional (verificar estado antes de mutar) que es más limpia en PL/pgSQL.
- Un `CALL sp_...` desde Drizzle participa en la transacción del use case si se pasa `tx`, o es autocommit si no. Para `sp_cancel_appointment` y `sp_complete_consultation`, el SP es autosuficiente — no requiere `tx` externo.
- Simplicidad: el use case queda en 3-5 líneas.

### RAISE EXCEPTION pattern
Los SPs de escritura usan `RAISE EXCEPTION` para errores de negocio (ej. cita ya completada). PostgreSQL propaga la excepción como error de JS en Drizzle. El repositorio puede capturarla y relanzarla como `AppError(mensaje, 422)`, manteniendo el contrato de no-try/catch en use cases ni rutas.

### Funciones vs procedimientos para read-only
`sp_get_available_slots` y `sp_get_patient_history` se definen como funciones `RETURNS TABLE` (no `PROCEDURE`) porque permiten `SELECT * FROM fn()` en Drizzle, lo cual es más ergonómico que `CALL` para resultados tabulares.

### Módulo appointments vs módulos separados
Se agrupa todo en un módulo `appointments` en lugar de separar `slots`, `consultations`, y `history` porque comparten el dominio de citas y el repositorio reutiliza la misma conexión y tipos de entidad.

## Standards aplicados

- `backend/use-case-pattern` — todos los use cases extienden `BaseUseCase`, `@injectable()`
- `backend/repository-pattern` — abstract class token, `toEntity()`, `TxClient`
- `backend/error-handling` — `AppError` para errores de dominio, sin try/catch en rutas
- `backend/module-registration` — `AppModule.load()`, dos pasos manuales en bootstrap y app
- `tech-drizzle` — `db.execute(sql\`...\`)` con tagged template literals para parámetros seguros
