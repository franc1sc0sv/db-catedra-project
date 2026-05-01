# Standards: Roles de PostgreSQL

## backend/error-handling

Lanzar `AppError` para todos los errores esperados. Nunca usar try/catch en rutas ni en casos de uso. El handler global vive en `app.ts`.

### Reglas

1. **Solo `AppError` para errores de negocio.** No lanzar `Error` genérico desde capas de dominio o aplicación.
2. **Nunca capturar en rutas.** Las rutas de Elysia no tienen try/catch — los errores burbujean al handler global.
3. **Nunca capturar en use cases.** Los use cases lanzan `AppError` y no los capturan.
4. **Handler global en `app.ts`.** Un único punto de captura formatea y devuelve la respuesta HTTP.

### Aplicación en este feature

Este feature no tiene código de aplicación (solo SQL). Sin embargo, si se escribe un script TypeScript para aplicar la migración (`db.execute`), aplican las mismas reglas:

- No envolver `db.execute` en try/catch dentro del script de migración.
- Dejar que el error propague y sea capturado por el proceso padre (Node.js / Bun runtime).
- Registrar el error a nivel de proceso, no silenciarlo.

### Ejemplo (script de migración TypeScript)

```ts
// packages/db/src/apply-roles-migration.ts
import { db } from './index';
import { sql } from 'drizzle-orm';
import { readFileSync } from 'fs';

// Sin try/catch — el error propaga al proceso
const migration = readFileSync('./src/migrations/0001_roles_postgresql.sql', 'utf-8');
await db.execute(sql.raw(migration));
console.log('Roles migration applied successfully');
```
