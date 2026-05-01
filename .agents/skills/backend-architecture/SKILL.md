---
name: Backend Architecture — Clean Architecture + Inversify + Elysia
description: Generate boilerplate and guide implementation for this project's backend architecture. Use when creating a new module, use case, repository, route, DTO, entity, or Inversify binding in apps/api. Triggers on "new module", "add use case", "create repository", "add route", "new feature", "add endpoint", or similar backend creation tasks inside this project.
---

# Backend Architecture Skill

This project uses **Clean Architecture** with **DDD vertical slices** inside `apps/api/src/modules/`. Each module is self-contained and registered via Inversify.

## Quick Reference

```
modules/{feature}/
├── {feature}.module.ts            ← Inversify bindings
├── application/
│   ├── dtos/inputs/               ← Elysia t.Object + Static<> (input schemas)
│   ├── dtos/outputs/              ← Elysia t.Object + Static<> (output schemas)
│   └── usecases/                  ← @injectable() extends BaseUseCase
├── domain/
│   ├── entities/                  ← Plain interface I{Name}
│   └── interfaces/                ← abstract class I{Name}Repository extends IBaseRepository
├── infrastructure/repositories/   ← @injectable() Drizzle implementation
└── presentation/
    └── {feature}.routes.ts        ← createRouter() + container.get(UC).execute()
```

## Creating a New Module — Checklist

Work through each layer in order. Read `references/layers.md` for full templates.

### 1. Entity (`domain/entities/{name}.entity.ts`)

Plain TypeScript interface. No classes, no decorators.

```typescript
export interface I{Name} {
  id: string
  // ... domain fields
  createdAt: Date
}
```

### 2. Repository Interface (`domain/interfaces/{name}.repository.ts`)

Abstract class (not TS interface) — must be a real JS value for Inversify to use as a token.

```typescript
import { IBaseRepository } from '~/common/base/base-repository.abstract'
import type { RepositoryMethod } from '~/common/base/repository-method.type'
import type { I{Name} } from '../entities/{name}.entity'

export abstract class I{Name}Repository extends IBaseRepository<I{Name}> {
  abstract create: RepositoryMethod<[data: Create{Name}Input], I{Name}>
  // add other methods as needed
}
```

### 3. DTOs (`application/dtos/`)

Each DTO file exports both the Elysia schema and the TypeScript type:

```typescript
// inputs/create-{name}.input.ts
import { t, type Static } from 'elysia'

export const Create{Name}InputSchema = t.Object({ ... })
export type Create{Name}Input = Static<typeof Create{Name}InputSchema>

// outputs/{name}.output.ts
import { t, type Static } from 'elysia'

export const {Name}OutputSchema = t.Object({ ... })
export type {Name}Output = Static<typeof {Name}OutputSchema>
```

### 4. Use Cases (`application/usecases/{action}-{name}.usecase.ts`)

Always `@injectable()`, always extend `BaseUseCase`. The `execute()` wraps everything in `db.transaction()` automatically.

```typescript
import { injectable } from 'inversify'
import type { TxClient } from '@project/db/src/client'
import { BaseUseCase } from '~/common/base/base-use-case.abstract'
import { AppError } from '~/common/errors/app-error'
import { I{Name}Repository } from '../../domain/interfaces/{name}.repository'
import type { Create{Name}Input } from '../dtos/inputs/create-{name}.input'
import type { {Name}Output } from '../dtos/outputs/{name}.output'

@injectable()
export class Create{Name}UseCase extends BaseUseCase<Create{Name}Input, {Name}Output> {
  constructor(private readonly repo: I{Name}Repository) { super() }

  protected async handle(input: Create{Name}Input, tx: TxClient): Promise<{Name}Output> {
    // business logic here — throw new AppError(message, statusCode) for errors
    const entity = await this.repo.create(input, tx)
    return { /* map to output */ }
  }
}
```

### 5. Repository Implementation (`infrastructure/repositories/drizzle-{name}.repository.ts`)

```typescript
import { injectable } from 'inversify'
import type { TxClient } from '@project/db/src/client'
import { {DbTable} } from '@project/db/src/schema/{schema-file}'
import { I{Name}Repository } from '../../domain/interfaces/{name}.repository'
import type { I{Name} } from '../../domain/entities/{name}.entity'

function to{Name}(row: typeof {DbTable}.$inferSelect): I{Name} {
  return { /* map row to entity */ }
}

@injectable()
export class Drizzle{Name}Repository extends I{Name}Repository {
  findById = async (id: string, tx: TxClient): Promise<I{Name} | null> => {
    const row = await tx.query.{DbTable}.findFirst({ where: eq({DbTable}.id, id) })
    return row ? to{Name}(row) : null
  }

  create = async (data: Create{Name}Input, tx: TxClient): Promise<I{Name}> => {
    const [row] = await tx.insert({DbTable}).values(data).returning()
    return to{Name}(row)
  }
}
```

### 6. Module (`{feature}.module.ts`)

```typescript
import type { Container } from 'inversify'
import type { AppModule } from '~/common/ioc/kernel'
import { I{Name}Repository } from './domain/interfaces/{name}.repository'
import { Drizzle{Name}Repository } from './infrastructure/repositories/drizzle-{name}.repository'
import { Create{Name}UseCase } from './application/usecases/create-{name}.usecase'

export class {Name}Module implements AppModule {
  load(container: Container): void {
    container.bind(I{Name}Repository).to(Drizzle{Name}Repository).inRequestScope()
    container.bind(Create{Name}UseCase).toSelf().inRequestScope()
    // bind every use case with .toSelf().inRequestScope()
  }
}
```

### 7. Routes (`presentation/{feature}.routes.ts`)

```typescript
import { createRouter } from '~/common/ioc/elysia-base'
import { betterAuthPlugin } from '~/auth-plugin'
import { Create{Name}UseCase } from '../application/usecases/create-{name}.usecase'
import { Create{Name}InputSchema } from '../application/dtos/inputs/create-{name}.input'
import { {Name}OutputSchema } from '../application/dtos/outputs/{name}.output'

export const {feature}Routes = createRouter({ prefix: '/{feature}' })
  .use(betterAuthPlugin)            // include if routes need auth
  .post(
    '/',
    ({ container, body }) => container.get(Create{Name}UseCase).execute(body),
    { body: Create{Name}InputSchema, response: {Name}OutputSchema, auth: true },
  )
```

### 8. Registration (2 files to edit)

**`common/ioc/bootstrap.ts`** — add the new module:
```typescript
const kernel = ApplicationKernel.getInstance([
  new UsersModule(),
  new HealthModule(),
  new {Name}Module(),  // ← add here
])
```

**`app.ts`** — mount the routes:
```typescript
export const app = new Elysia({ adapter: BunAdapter })
  .use(healthRoutes)
  .use(usersRoutes)
  .use({feature}Routes)  // ← add here
```

## Key Rules

- **Inversify tokens** are abstract classes, not Symbols. `IUsersRepository` is an abstract class so it has a runtime value. Never use plain TypeScript `interface` as a token.
- **No `@inject()` needed** — Inversify resolves constructor params by type via `reflect-metadata` when params are typed to abstract classes.
- **All use cases extend `BaseUseCase`** — never call the DB directly outside `handle()`. The `execute()` method always runs inside `db.transaction()`.
- **Always `.inRequestScope()`** — all bindings use request scope.
- **Throw `AppError`** in use cases for domain errors. The global handler in `app.ts` converts them to HTTP responses.
- **`auth: true`** on a route option triggers the `betterAuthPlugin` macro, which resolves `{ user, session }` into context.

## Reference Files

- `references/layers.md` — full file templates for every layer
- `references/inversify.md` — Inversify patterns, scope rules, module registration
- `references/error-handling.md` — AppError, global handler, status codes
