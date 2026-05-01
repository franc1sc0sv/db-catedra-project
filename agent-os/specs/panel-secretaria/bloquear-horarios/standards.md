# Standards: Bloquear Horarios

## backend/use-case-pattern

Use cases son clases `@injectable()` que extienden `BaseUseCase<TInput, TOutput>` e implementan `handle(input: TInput): Promise<TOutput>`.

- Toda validación de negocio ocurre en `handle()`.
- Errores se lanzan como `AppError(message, statusCode)` — nunca se capturan en la ruta.
- El use case no conoce HTTP ni Elysia; solo la lógica de dominio.

```ts
// Ejemplo de conflicto:
throw new AppError('El slot tiene una cita activa, cancélala primero', 409)

// Ejemplo de not found:
throw new AppError('Bloqueo no encontrado', 404)
```

Referencia: `apps/api/src/modules/users/application/usecases/get-me.usecase.ts`

---

## backend/repository-pattern

Los repositorios son clases que implementan una interfaz abstracta. El use case depende de la interfaz (inyectada por Inversify), no de la implementación concreta.

- Métodos retornan entidades de dominio (via `toEntity()`).
- Soporte de transacciones via `TxClient`.
- Tipos inferidos con `$inferSelect` / `$inferInsert` de Drizzle.

---

## backend/error-handling

- Solo `AppError` para errores de negocio y validación.
- El manejador global en `app.ts` convierte `AppError` en respuesta HTTP con `statusCode` y `message`.
- Nunca usar `try/catch` en rutas ni en use cases — dejar propagar.
- Códigos usados en este feature: `404` (no encontrado), `409` (conflicto con cita activa).

---

## frontend/entity-schemas

Schemas Zod en `apps/web/src/entities/[name]/model/schemas.ts`.

- Exportar el schema y el tipo inferido en el mismo archivo.
- El tipo inferido se usa en toda la feature (forms, API calls, props).

```ts
// Patrón:
export const createBlockInputSchema = z.object({ ... })
export type CreateBlockInput = z.infer<typeof createBlockInputSchema>
```

---

## frontend/fsd-public-api

Cada slice de FSD expone un `index.ts` como único punto de importación.

- Nunca importar directamente desde sub-carpetas de otro slice.
- El `index.ts` de `features/block-schedule/` reexporta solo lo necesario para consumidores externos.

```ts
// apps/web/src/features/block-schedule/index.ts
export { BloquearHorariosForm } from './ui/BloquearHorariosForm'
```

---

## Skill references

| Skill | Uso en este feature |
|-------|-------------------|
| `/tech-drizzle` | INSERT múltiple en ScheduleEvents, consulta de conflictos por fecha/hora |
| `/tech-elysia` | Definición de rutas POST /schedule-events/block y DELETE /schedule-events/:id |
| `/backend-architecture` | Scaffolding de use cases, DTOs, bindings Inversify |
| `/frontend-design` | Time range selector, block type selector, alert de conflicto, shadcn components |
| `/frontend-architecture` | Placement FSD: entities, features, public API |
