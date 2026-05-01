# Correcciones de Schema

## ¿Qué hace esta parte del sistema?

Antes de implementar cualquier otra pieza del sistema, el schema actual requiere tres correcciones puntuales. Estas no son cambios de diseño grandes sino ajustes que alinean el schema con la realidad del negocio y con los comportamientos que los triggers ya implementan. Sin estas correcciones, los triggers fallarían en runtime o el sistema rechazaría datos válidos.

Las tres correcciones son independientes entre sí y pueden aplicarse en una sola migración de Drizzle. Una vez aplicadas, el schema queda estable para el resto del desarrollo.

## ¿Quién la usa?

El desarrollador que mantiene el schema y genera las migraciones con drizzle-kit.

## ¿Cómo funciona?

La primera corrección es en `Patients.userId`: actualmente el campo está definido como NOT NULL, pero la propuesta del sistema contempla que la secretaria pueda registrar pacientes que llegan por WhatsApp sin que esos pacientes tengan una cuenta web creada. En ese flujo, el paciente existe en la tabla `Patients` con su DUI, nombre y teléfono, pero no tiene un registro en `Users`. Por eso `userId` debe ser nullable. En Drizzle esto se expresa eliminando el `.notNull()` del campo y regenerando la migración; drizzle-kit producirá un `ALTER COLUMN userId DROP NOT NULL`.

La segunda corrección es en `MedicalRecords.bloodType`: el trigger `trg_create_medical_record` inserta un nuevo `MedicalRecord` con `bloodType = NULL` cada vez que se registra un paciente, porque el tipo de sangre real es desconocido en el momento del registro y solo la doctora puede confirmarlo durante la primera consulta clínica. Si el campo tuviera un valor por defecto forzado como `'O+'`, estaría registrando información médica falsa. El campo ya tiene el tipo correcto en el enum de Drizzle; solo hay que asegurarse de que no tenga `.notNull()`. Drizzle-kit generará el `ALTER` correspondiente si es necesario.

La tercera corrección es en el enum `availabilityStatusEnum` de la tabla `ScheduleEvents`: los valores actuales son `available`, `busy` y `blocked`, pero el ciclo de vida completo de un evento médico requiere dos estados adicionales. `completed` marca que la consulta fue atendida y tiene un registro en `ClinicalConsultations`; `cancelled` marca que la cita fue cancelada por la secretaria, liberando el slot. Sin estos valores, el stored procedure `sp_cancel_appointment` y `sp_complete_consultation` no pueden actualizar el estado del evento. En PostgreSQL los enums no se modifican con `ALTER TYPE ... ADD VALUE` dentro de una transacción si hay otras operaciones en la misma, así que drizzle-kit generará una migración específica que usa la secuencia `CREATE TYPE ... AS ENUM` con los cinco valores y migra la columna. Conviene revisar el SQL generado antes de ejecutarlo en producción.

## Skills relevantes

- `/tech-drizzle` — modificar los campos en el schema de Drizzle y ejecutar `drizzle-kit generate` + `drizzle-kit migrate` para producir y aplicar las migraciones; revisar el SQL generado antes de correr en producción, especialmente para el cambio de enum
