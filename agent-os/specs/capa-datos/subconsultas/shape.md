# Shape — Subconsultas

## Scope

- 1 archivo nuevo: `packages/db/src/queries/subqueries.ts`
- 3 funciones exportadas, cada una encapsula una técnica de subconsulta distinta
- Sin cambios a schema, sin migraciones, sin nuevas tablas
- Sin nuevos endpoints (las funciones son utilidades que los repositorios/casos de uso pueden llamar)

## Decisiones de diseño

### `sql` template literal vs `db.query`

Se usa `sql\`...\`` con `db.execute()` porque:
1. Las subconsultas correlacionadas y `NOT EXISTS` no tienen equivalente directo en la API relacional de Drizzle
2. El query builder (`db.select`) no soporta subconsultas correlacionadas en WHERE de forma idiomática
3. Para la tabla derivada en FROM, el `sql` raw es más legible que encadenar múltiples operadores de Drizzle

### Tipado de resultados

`$inferSelect` aplica solo a queries construidos con el query builder. Para `db.execute(sql\`...\``)` el resultado es `unknown[]`, por lo que se definen interfaces TypeScript explícitas y se hace cast con `as InterfaceName[]`.

### Ubicación del archivo

`packages/db/src/queries/subqueries.ts` en lugar de dentro de un módulo de `apps/api` porque:
- Las tres subconsultas no pertenecen a un único dominio
- Son utilidades de base de datos reutilizables entre módulos
- El paquete `db` ya expone el cliente y el schema; es el lugar natural para queries raw compartidos

### Parámetro `db: TxClient`

Todas las funciones reciben `db: TxClient` (igual que los repositorios del proyecto) para ser compatibles con transacciones y para no crear dependencias implícitas en el cliente global.

## Standards aplicados

- `backend/repository-pattern`: patrón de parámetro `TxClient`, tipado explícito
- `/tech-drizzle`: `sql` template literal para queries raw, interfaces para tipos de retorno
