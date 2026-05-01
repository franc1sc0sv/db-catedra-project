# Shape Notes — correcciones-schema

## Scope

Tres modificaciones de columna/enum en el schema Drizzle existente. No hay nueva lógica de aplicación, no hay nuevas tablas, no hay cambios de API. El alcance está deliberadamente acotado: estas son precondiciones para que el resto del sistema funcione, no un cambio de diseño.

## Decisiones

### Por qué nullable y no un default

`Patients.userId` no recibe un UUID de usuario por defecto porque no existe ningún usuario al cual apuntar. Un default falso rompería la integridad referencial. La solución correcta es NULL.

`MedicalRecords.bloodType` no recibe un default como `'O+'` porque eso registraría información médica falsa. Solo la doctora puede confirmar el tipo de sangre real durante la primera consulta. NULL es la representación semántica correcta de "desconocido".

### Por qué revisar el SQL del enum antes de migrar

PostgreSQL no permite `ALTER TYPE ... ADD VALUE` dentro de una transacción con otras operaciones DDL. Drizzle-kit maneja esto generando una secuencia de pasos (drop default, alter type, restore default o recrear la columna). El SQL generado puede variar según la versión de drizzle-kit y el estado actual de la base de datos. Siempre revisar antes de ejecutar en un entorno compartido o de producción.

### Por qué una sola migración

Las tres correcciones son independientes entre sí pero todas son precondiciones del mismo conjunto de stored procedures. Agruparlas en una sola migración simplifica el historial y garantiza que la base de datos nunca quede en un estado intermedio donde algunos triggers funcionen y otros no.

## Contexto

- Los triggers `trg_create_medical_record` y los stored procedures `sp_cancel_appointment` / `sp_complete_consultation` ya existen en `packages/db/src/schema/triggers.ts`. Estas correcciones los desbloquean.
- El índice `patients_user_id_idx` sobre `Patients.userId` permanece aunque la columna sea nullable: sigue siendo útil para buscar pacientes por usuario cuando el vínculo existe.

## Standards aplicados

- `/tech-drizzle` — schema design, nullable fields, enum extension, migration generation and review
