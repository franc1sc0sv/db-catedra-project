# Code References — correcciones-schema

## Archivos a modificar

### `packages/db/src/schema/patients.schema.ts`
- Campo afectado: `userId` — línea 7
- Cambio: eliminar `.notNull()` del campo `userId`
- Estado actual: `uuid('userId').notNull().references(() => Users.id)`
- Estado objetivo: `uuid('userId').references(() => Users.id)`

### `packages/db/src/schema/medical-records.schema.ts`
- Campo afectado: `bloodType` — línea 10
- Cambio: eliminar `.notNull()` del campo `bloodType`
- Estado actual: `bloodTypeEnum('bloodType').notNull()`
- Estado objetivo: `bloodTypeEnum('bloodType')`

### `packages/db/src/schema/enums.ts`
- Enum afectado: `availabilityStatusEnum` — líneas 27-29
- Cambio: añadir `'completed'` y `'cancelled'` al array de valores
- Estado actual: `['available', 'busy', 'blocked']`
- Estado objetivo: `['available', 'busy', 'blocked', 'completed', 'cancelled']`

## Archivos de referencia (solo lectura)

### `packages/db/src/schema/triggers.ts`
Contiene `trg_create_medical_record` (usa `bloodType = NULL`), `sp_cancel_appointment` (usa `'cancelled'`) y `sp_complete_consultation` (usa `'completed'`). Estas correcciones desbloquean esos triggers y stored procedures.

### `packages/db/src/schema/relations.ts`
Define la relación entre `Patients` y `Users`. La relación permanece válida con `userId` nullable — Drizzle soporta relaciones opcionales.

### `packages/db/src/schema/index.ts`
Barrel de exports del schema. No requiere cambios — los tipos actualizados se propagan automáticamente.

### `packages/db/src/migrations/`
Directorio donde drizzle-kit deposita los archivos `.sql` generados. Revisar el archivo de migración creado por `db:generate` antes de ejecutar `db:migrate`.
