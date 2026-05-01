# References — Subconsultas

## Patrón de repositorio Drizzle (referencia principal)

**Archivo:** `apps/api/src/modules/users/infrastructure/repositories/drizzle-users.repository.ts`

Este archivo es la referencia canónica para:

1. **Firma de métodos con `TxClient`** — todos los métodos reciben `db: TxClient` como primer parámetro, lo que permite operar dentro de una transacción externa o con el cliente global.

2. **Uso de `$inferSelect`** — las filas crudas de Drizzle se tipan con el tipo inferido del schema antes de pasarlas a `toEntity()`.

3. **Patrón `toEntity()`** — mapeo explícito de fila de base de datos a entidad de dominio. Para `subqueries.ts`, el equivalente es el cast `as InterfaceName[]` ya que no hay entidad de dominio asociada.

4. **Importación del cliente** — el cliente de base de datos se importa desde `packages/db` (no se crea un cliente nuevo por archivo).

## Schema de tablas referenciadas

**Directorio:** `packages/db/src/schema/`

Tablas usadas por las subconsultas:
- `patients` — subconsulta 1 (tabla principal) y subconsulta 3 (a través de appointments)
- `medical_appointments` — subconsultas 1 y 3
- `schedule_events` — subconsulta 2
- `clinical_consultations` — subconsulta 3

Consultar los archivos de schema para confirmar nombres exactos de columnas (snake_case en DB, camelCase en Drizzle) antes de escribir el SQL raw.

## Drizzle `sql` template literal

```typescript
import { sql } from 'drizzle-orm';

// Ejecutar query raw y castear resultado
const rows = await db.execute(sql`
  SELECT ...
`);
const typed = rows as MyInterface[];
```

La función `sql` de `drizzle-orm` escapa valores interpolados automáticamente. Para valores dinámicos seguros usar `sql.placeholder()` o interpolación directa con `${value}` (Drizzle los parametriza).
