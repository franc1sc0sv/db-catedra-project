# Standards Applied — correcciones-schema

## Skill aplicado: `/tech-drizzle`

Todas las tareas de esta feature usan el skill `/tech-drizzle`.

### Campos nullable

Eliminar `.notNull()` de una columna en Drizzle es el cambio mínimo para hacerla nullable. Drizzle-kit detecta la diferencia entre el schema TypeScript y la base de datos y genera `ALTER COLUMN ... DROP NOT NULL`. No se necesita ningún cambio adicional en la definición de la tabla.

```ts
// Antes — rechaza NULL en runtime
userId: uuid('userId').notNull().references(() => Users.id),

// Después — acepta NULL
userId: uuid('userId').references(() => Users.id),
```

### Tipos inferidos

Los tipos `$inferSelect` y `$inferInsert` se actualizan automáticamente cuando se elimina `.notNull()`. El campo pasa de `string` a `string | null` en `$inferSelect` y a `string | null | undefined` en `$inferInsert`. No se requieren cambios manuales en los tipos exportados.

```ts
export type Patient    = typeof Patients.$inferSelect  // userId: string | null
export type NewPatient = typeof Patients.$inferInsert  // userId?: string | null
```

### Extensión de enum

Los enums de Drizzle se definen como arrays de strings literales. Añadir valores al array amplía el tipo en TypeScript y produce la migración DDL correspondiente en PostgreSQL.

```ts
export const availabilityStatusEnum = pgEnum('availability_status', [
  'available', 'busy', 'blocked', 'completed', 'cancelled',
])
```

Drizzle-kit genera la migración necesaria para actualizar el tipo enum en PostgreSQL. Revisar el SQL antes de ejecutar porque la estrategia de migración de enums puede incluir pasos de recreación de columna.

### Flujo de migración

```bash
# 1. Generar — produce archivos SQL en packages/db/src/migrations/
pnpm --filter @project/db db:generate

# 2. Revisar — abrir el archivo .sql generado y validar cada sentencia
# Especialmente para el enum: verificar que incluye los 5 valores

# 3. Aplicar
pnpm --filter @project/db db:migrate
```

### Regla: push vs generate

En desarrollo local se puede usar `db:push` para iterar rápido. Para cambios que van a ser committed y aplicados en entornos compartidos (staging, producción), siempre usar `db:generate` + revisar el SQL + `db:migrate`. Esta feature toca un enum, lo cual hace la revisión especialmente importante.

### Regla: revisar el SQL generado

Drizzle-kit infiere las migraciones a partir de diffs del schema. Siempre revisar el SQL antes de hacer commit, especialmente para:
- Cambios de enum (puede generar recreación de columna)
- `DROP NOT NULL` (no destructivo, pero confirmar que apunta a la columna correcta)
