# Shape: Roles de PostgreSQL

## Scope

Creación de cuatro roles PostgreSQL con privilegios diferenciados. Aplica únicamente a nivel de motor de base de datos — no hay código de aplicación nuevo, solo un archivo SQL de migración numerado.

Archivos afectados:
- `packages/db/src/migrations/0001_roles_postgresql.sql` — archivo nuevo

Archivos no afectados:
- Schema Drizzle (`packages/db/src/schema/`) — solo lectura para confirmar nombres de tablas
- Código de aplicación (`apps/api/`, `apps/web/`) — sin cambios

## Decisiones

### SQL file vs Drizzle schema

Drizzle no gestiona roles PostgreSQL de forma nativa. Intentar hacerlo desde `schema.ts` requeriría `db.execute(sql\`...\`)` ad-hoc sin soporte de diff/rollback. La solución correcta es un archivo SQL numerado en `packages/db/src/migrations/` que sea idempotente y versionado junto al resto de migraciones.

### RLS vs SECURITY BARRIER view para rol_paciente

Ambas opciones aíslan las filas visibles por `rol_paciente` en `scheduleEvents`:

| Criterio | RLS | SECURITY BARRIER view |
|---|---|---|
| Complejidad | Baja — 1 política, 1 ALTER TABLE | Media — requiere crear y mantener una vista |
| Transparencia | Alta — la tabla base es la misma | Baja — el rol accede a un objeto diferente |
| Rendimiento | Igual (planner aware) | Igual |
| Mantenimiento | Un solo lugar (política) | Vista + grants duplicados |

Decisión: **RLS directamente sobre la tabla**. La política usa `USING (true)` como placeholder; la app es responsable de establecer `app.current_user_id` vía `SET LOCAL` antes de ejecutar queries como `rol_paciente`. Esto es suficiente para el MVP y se puede refinar con una política más estricta cuando se implemente la capa de sesión.

### Restricción de columna doctorPrivateNotes para rol_secretaria

PostgreSQL no soporta DENY explícito. Se otorgan `SELECT` solo sobre las columnas permitidas de `clinicalConsultations`, omitiendo `doctorPrivateNotes`. `rol_secretaria` no tiene `GRANT` sobre la tabla completa, solo column-level grants.

## Standards aplicados

- `backend/error-handling` — no aplica directamente (sin código de aplicación), pero el script de aplicación de la migración debe propagar errores sin silenciarlos.
- `/tech-drizzle` — roles fuera del schema Drizzle, en archivo SQL numerado.
