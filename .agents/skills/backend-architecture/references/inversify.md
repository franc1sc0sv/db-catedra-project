# Inversify — IoC Patterns

## How It Works in This Project

Inversify uses `reflect-metadata` + TypeScript's emitted type metadata to resolve constructor parameters automatically. **No `@inject()` decorators are needed** because repository interfaces are `abstract class` (real JS values), not TypeScript `interface` (erased at compile time).

```typescript
// ✅ Works — abstract class is a real JS value at runtime
export abstract class IUsersRepository extends IBaseRepository<IUser> { ... }
container.bind(IUsersRepository).to(DrizzleUsersRepository)

// ❌ Would NOT work — TS interface is erased at runtime, nothing to bind
export interface IUsersRepository { ... }
```

## Container Lifecycle

```
ApplicationKernel (singleton)
  └── Inversify Container (defaultScope: 'Request')
        ├── UsersModule.load(container)
        ├── HealthModule.load(container)
        └── {NewModule}.load(container)
```

`ApplicationKernel.getInstance([...modules])` is called once in `bootstrap.ts`. The container is shared across the app via `createRouter()` which decorates every router with `container`.

## Binding Patterns

```typescript
// Repository: interface → implementation
container.bind(IUsersRepository).to(DrizzleUsersRepository).inRequestScope()

// Use case: concrete class → itself
container.bind(CreateUserUseCase).toSelf().inRequestScope()

// Use case without dependency: same
container.bind(HealthCheckUseCase).toSelf().inRequestScope()
```

**Always use `.inRequestScope()`** — creates a new instance per request, not a singleton.

## Resolving in Routes

Routes never use `@inject()` — they get the container from context and resolve on demand:

```typescript
.get('/:id', ({ container, params }) =>
  container.get(GetUserUseCase).execute(params)
)
```

`container.get(UseCase)` creates a new instance (request-scoped) and recursively resolves all constructor dependencies.

## Adding a New Module — Steps

1. Create `{feature}.module.ts` with bindings
2. Add `new {Feature}Module()` to the array in `bootstrap.ts`:

```typescript
// bootstrap.ts
const kernel = ApplicationKernel.getInstance([
  new UsersModule(),
  new HealthModule(),
  new PatientsModule(),  // ← add here
])
```

3. Mount routes in `app.ts`:

```typescript
export const app = new Elysia({ adapter: BunAdapter })
  .use(healthRoutes)
  .use(usersRoutes)
  .use(patientsRoutes)  // ← add here
```

## tsconfig Requirements

The project requires these settings for Inversify to work (already configured):
```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

And `import 'reflect-metadata'` must appear once at the app entry point (it's in `bootstrap.ts` and `kernel.ts`).
