# Correcciones de Schema

## Qué hace esta feature

Esta feature agrupa tres correcciones quirúrgicas al schema de Drizzle ORM que deben aplicarse antes de que cualquier otra pieza del sistema pueda funcionar correctamente. No son cambios de diseño: son ajustes que alinean las definiciones de columna con el comportamiento real del negocio y con los triggers PostgreSQL ya implementados. Sin ellas, los stored procedures fallarían en runtime o se registraría información médica falsa.

Las tres correcciones son independientes y se aplican en una sola sesión de `drizzle-kit generate` + `drizzle-kit migrate`.

## Por qué existe

El schema inicial fue generado a partir de un modelo de datos conceptual. Al detallar los flujos de negocio reales aparecieron tres discrepancias:

1. La secretaria puede registrar pacientes que llegan por WhatsApp antes de que esos pacientes creen una cuenta web. El campo `Patients.userId` tiene `NOT NULL`, lo que impide ese registro.
2. El trigger `trg_create_medical_record` inserta una fila en `MedicalRecords` con `bloodType = NULL` porque el tipo de sangre es desconocido al momento del registro. El campo `bloodType` tiene `NOT NULL`, lo que hace fallar el trigger.
3. Los stored procedures `sp_cancel_appointment` y `sp_complete_consultation` actualizan `ScheduleEvents.availabilityStatus` a `'cancelled'` y `'completed'`, valores que no existen en el enum `availability_status`. Cualquier llamada a esos procedures lanza un error de violación de enum.

## Implementación con Drizzle

### Corrección 1 — `Patients.userId` nullable

En `packages/db/src/schema/patients.schema.ts`, el campo actualmente es:

```ts
userId: uuid('userId').notNull().references(() => Users.id),
```

Se elimina `.notNull()`:

```ts
userId: uuid('userId').references(() => Users.id),
```

Drizzle-kit produce `ALTER TABLE "Patients" ALTER COLUMN "userId" DROP NOT NULL`.

### Corrección 2 — `MedicalRecords.bloodType` nullable

En `packages/db/src/schema/medical-records.schema.ts`, el campo actualmente es:

```ts
bloodType: bloodTypeEnum('bloodType').notNull(),
```

Se elimina `.notNull()`:

```ts
bloodType: bloodTypeEnum('bloodType'),
```

Drizzle-kit produce `ALTER TABLE "MedicalRecords" ALTER COLUMN "bloodType" DROP NOT NULL`.

### Corrección 3 — Ampliar `availabilityStatusEnum`

En `packages/db/src/schema/enums.ts`, el enum actualmente es:

```ts
export const availabilityStatusEnum = pgEnum('availability_status', [
  'available', 'busy', 'blocked',
])
```

Se añaden los dos valores faltantes:

```ts
export const availabilityStatusEnum = pgEnum('availability_status', [
  'available', 'busy', 'blocked', 'completed', 'cancelled',
])
```

PostgreSQL no permite añadir valores a un enum existente dentro de una transacción cuando hay otras operaciones en la misma migración. Drizzle-kit detecta el cambio en el enum y genera una secuencia `CREATE TYPE ... AS ENUM` con los cinco valores más la migración de la columna. El SQL generado debe revisarse antes de ejecutarlo en producción.

## Resultado esperado

Tras aplicar la migración:

- Una secretaria puede crear un paciente sin cuenta web (sin `userId`).
- El trigger de creación de historia clínica inserta con `bloodType = NULL` sin error.
- Los stored procedures de cancelar cita y completar consulta pueden actualizar el estado del evento correctamente.
- El schema queda estable para el resto del desarrollo de la capa de datos.
