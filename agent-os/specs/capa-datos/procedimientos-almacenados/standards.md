# Procedimientos Almacenados — Standards

## backend/use-case-pattern

Todos los use cases extienden `BaseUseCase<TInput, TOutput>` y están decorados con `@injectable()`.

```ts
@injectable()
export class DoSomethingUseCase extends BaseUseCase<Input, Output> {
  constructor(private readonly repo: ISomeRepository) { super() }
  protected async handle(input: Input, tx: TxClient): Promise<Output> {
    // business logic here
  }
}
```

Reglas:
- `execute()` envuelve cada llamada en una transacción de DB automáticamente.
- La lógica de negocio vive en `handle()`, nunca en `execute()`.
- Bind en módulo: `container.bind(DoSomethingUseCase).toSelf().inRequestScope()`
- Lanzar `AppError` para errores de dominio.

---

## backend/repository-pattern

Las interfaces de repositorio son abstract classes (no interfaces TS — Inversify necesita token en runtime).

```ts
export abstract class IThingsRepository extends IBaseRepository<IThing> {
  abstract findByName: RepositoryMethod<[name: string], IThing | null>
}

@injectable()
export class DrizzleThingsRepository extends IThingsRepository {
  findById = async (id: string, tx: TxClient): Promise<IThing | null> => { ... }
}
```

Reglas:
- Mapear filas DB con método privado `toEntity(row)` — nunca devolver filas crudas.
- Usar `$inferSelect` como tipo de fila.
- Todos los métodos aceptan `tx: TxClient` como último argumento.
- Bind: `container.bind(IThingsRepository).to(DrizzleThingsRepository).inRequestScope()`

---

## backend/error-handling

Lanzar `AppError` para todos los errores de dominio/negocio esperados. Nunca try/catch dentro de use cases o rutas.

```ts
throw new AppError('Cita no encontrada', 404)
throw new AppError('La cita ya fue completada', 422)
throw new AppError('Sin permisos suficientes', 403)
```

Reglas:
- NO envolver llamadas a use cases en try/catch en las rutas.
- Los errores inesperados pasan al handler 500 por defecto de Elysia.
- Los errores de PostgreSQL (`RAISE EXCEPTION`) deben capturarse en el repositorio y relanzarse como `AppError` con el mensaje y código HTTP apropiados.

---

## backend/module-registration

```ts
export class ThingsModule implements AppModule {
  load(container: Container): void {
    container.bind(IThingsRepository).to(DrizzleThingsRepository).inRequestScope()
    container.bind(DoSomethingUseCase).toSelf().inRequestScope()
  }
}
```

Dos pasos manuales obligatorios:
1. `apps/api/src/common/ioc/bootstrap.ts` — agregar `new ThingsModule().load(container)` al kernel.
2. `apps/api/src/app.ts` — montar las rutas del módulo con el prefijo correspondiente.

El orden importa: registrar el módulo antes de montar las rutas.
