# Shape — Datos Semilla

## Alcance

| Incluido | Excluido |
|---|---|
| Script TypeScript en `packages/db/src/seed.ts` | Script SQL puro |
| Batches de INSERT para 8 tablas | Datos de producción |
| Verificación de triggers post-insert | Tests automatizados del seed |
| DML explícitos (UPDATE, DELETE, SELECT) | Interfaz de usuario para seed |
| Script `db:seed` en package.json | Reset/teardown de la BD |

## Decisiones

### TypeScript vs SQL puro
Se usa TypeScript con Drizzle ORM. Motivos:
- Coherencia con el resto del proyecto (todo el acceso a datos usa Drizzle)
- Type-safety en los valores insertados (el compilador atrapa errores de tipo antes de ejecutar)
- Más fácil reutilizar helpers del proyecto (hasher de passwords, enums)

### Transacción única vs batches independientes
Todo el seed corre en una sola `db.transaction()`. Si un paso falla, la BD queda en estado limpio. Los verificadores de triggers leen dentro de la misma transacción para evitar lecturas sucias.

### Verificación de triggers: SELECT inline vs test externo
Se usa SELECT inline dentro del script (no un test framework). Permite al evaluador ejecutar un solo comando y ver en la terminal que los triggers funcionaron, sin necesidad de configurar Jest/Vitest.

### Contraseñas en seed
Las contraseñas de los usuarios de prueba se hashean con el mismo mecanismo que usa `better-auth` en el proyecto. No se almacenan en texto plano ni en el repo.

### Datos en español
Todos los valores de texto del seed (diagnósticos, notas, etc.) están en español para coherencia con el dominio médico del sistema.

## Estándares aplicados

- `use-case-pattern` — no aplica directamente al seed (no es un use case de la API), pero la transacción atomizada sigue el mismo principio
- `/tech-drizzle` — `db.insert().values([...])` en batches, `db.transaction()`, SELECT de verificación
