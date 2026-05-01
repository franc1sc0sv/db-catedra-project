# Standards — Subconsultas

## backend/repository-pattern

Las interfaces de repositorio son clases abstractas (no interfaces TypeScript). Cada método recibe `db: TxClient` como primer parámetro para soportar transacciones. Los resultados de queries se mapean a entidades de dominio mediante un método `toEntity()`. Se usan los tipos `$inferSelect` de Drizzle para tipar las filas crudas antes del mapeo.

Para queries raw con `sql` template literal (casos donde el query builder no alcanza), el tipo de retorno de `db.execute()` es `unknown[]`. Se define una interfaz TypeScript explícita y se castea el resultado con `as InterfaceName[]`. Esto mantiene type safety sin sacrificar la expresividad del SQL.

**Aplicación en este feature:** Las tres funciones de `subqueries.ts` reciben `db: TxClient`, definen interfaces de retorno explícitas, y castean el resultado de `db.execute()`.

---

## backend/use-case-pattern

Los casos de uso extienden `BaseUseCase<TInput, TOutput>` y se decoran con `@injectable()` de Inversify. La lógica de negocio vive en el método `handle(input: TInput): Promise<TOutput>`. Los errores de dominio se lanzan como `AppError` (nunca errores genéricos). Los casos de uso no conocen detalles de infraestructura — reciben repositorios por inyección de dependencias.

**Aplicación en este feature:** Si en el futuro se exponen las subconsultas como endpoints, cada una debe tener su propio caso de uso (`GetFrequentPatientsUseCase`, etc.) que llame al repositorio correspondiente. Las funciones en `subqueries.ts` son capa de infraestructura (repositorio), no casos de uso.
