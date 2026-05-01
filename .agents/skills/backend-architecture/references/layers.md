# Layer Templates — Full File Examples

All templates use the `users` module as the reference implementation.

## Entity

**File**: `domain/entities/{name}.entity.ts`

```typescript
import type { UserRole } from '@project/enums/src/user-role.enum'
import type { AccountStatus } from '@project/enums/src/account-status.enum'

export interface IUser {
  id: string
  email: string
  passwordHash: string | null
  role: UserRole
  accountStatus: AccountStatus
  createdAt: Date
}
```

Rules:
- Always a plain TypeScript `interface`, never a class
- Prefix with `I` (e.g. `IUser`, `IPatient`)
- Only domain fields — no Drizzle types, no DB-specific types
- Import shared enums from `@project/enums`

---

## Repository Interface

**File**: `domain/interfaces/{name}.repository.ts`

```typescript
import { IBaseRepository } from '~/common/base/base-repository.abstract'
import type { RepositoryMethod } from '~/common/base/repository-method.type'
import type { IUser } from '../entities/user.entity'
import type { CreateUserInput } from '../../application/dtos/inputs/create-user.input'

export abstract class IUsersRepository extends IBaseRepository<IUser> {
  abstract findByEmail: RepositoryMethod<[email: string], IUser | null>
  abstract create:      RepositoryMethod<[data: CreateUserInput & { passwordHash: string }], IUser>
  abstract deactivate:  RepositoryMethod<[id: string], void>
}
```

Rules:
- `abstract class`, NOT `interface` — must be a runtime value for Inversify
- Extends `IBaseRepository<TEntity>` which provides `findById`
- Methods typed as `RepositoryMethod<[args], Return>` — this enforces the `tx: TxClient` last param automatically
- `findById` is inherited from base — don't redeclare it

**`RepositoryMethod` signature**:
```typescript
type RepositoryMethod<TArgs extends unknown[], TReturn> =
  (...args: [...TArgs, tx: TxClient]) => Promise<TReturn>
```

---

## Input DTO

**File**: `application/dtos/inputs/{action}-{name}.input.ts`

```typescript
import { t, type Static } from 'elysia'
import { UserRole } from '@project/enums/src/user-role.enum'

export const CreateUserInputSchema = t.Object({
  email:    t.String({ format: 'email' }),
  password: t.String({ minLength: 8 }),
  role:     t.Enum(UserRole),
})

export type CreateUserInput = Static<typeof CreateUserInputSchema>
```

```typescript
// params example (path params)
import { t, type Static } from 'elysia'

export const GetUserParamsSchema = t.Object({
  id: t.String(),
})

export type GetUserParams = Static<typeof GetUserParamsSchema>
```

Rules:
- Schema name: `{Action}{Name}InputSchema` / `{Action}{Name}ParamsSchema`
- Type name: `{Action}{Name}Input` / `{Action}{Name}Params`
- Use `t.String({ format: 'email' })`, `t.Number({ minimum: 0 })` etc. for constraints
- Use `t.Enum(EnumObject)` for enum fields — import from `@project/enums`
- `Static<typeof Schema>` generates the TypeScript type — no duplication

---

## Output DTO

**File**: `application/dtos/outputs/{name}.output.ts`

```typescript
import { t, type Static } from 'elysia'
import { UserRole } from '@project/enums/src/user-role.enum'
import { AccountStatus } from '@project/enums/src/account-status.enum'

export const UserOutputSchema = t.Object({
  id:            t.String(),
  email:         t.String(),
  role:          t.Enum(UserRole),
  accountStatus: t.Enum(AccountStatus),
  createdAt:     t.Date(),
})

export type UserOutput = Static<typeof UserOutputSchema>
```

Rules:
- Never expose `passwordHash` or internal fields in output DTOs
- `t.Date()` for Date fields (Elysia serializes them correctly)
- Schema = Elysia route response validation; type = TypeScript return type

---

## Use Case

**File**: `application/usecases/{action}-{name}.usecase.ts`

```typescript
import { injectable } from 'inversify'
import { createHash } from 'crypto'
import type { TxClient } from '@project/db/src/client'
import { BaseUseCase } from '~/common/base/base-use-case.abstract'
import { AppError } from '~/common/errors/app-error'
import { IUsersRepository } from '../../domain/interfaces/users.repository'
import type { CreateUserInput } from '../dtos/inputs/create-user.input'
import type { UserOutput } from '../dtos/outputs/user.output'

@injectable()
export class CreateUserUseCase extends BaseUseCase<CreateUserInput, UserOutput> {
  constructor(private readonly users: IUsersRepository) { super() }

  protected async handle(input: CreateUserInput, tx: TxClient): Promise<UserOutput> {
    const existing = await this.users.findByEmail(input.email, tx)
    if (existing) throw new AppError('Email already in use', 409)

    const passwordHash = createHash('sha256').update(input.password).digest('hex')
    const user = await this.users.create({ ...input, passwordHash }, tx)

    return {
      id:            user.id,
      email:         user.email,
      role:          user.role,
      accountStatus: user.accountStatus,
      createdAt:     user.createdAt,
    }
  }
}
```

**Use case without repository** (e.g. health check):

```typescript
@injectable()
export class HealthCheckUseCase extends BaseUseCase<void, HealthOutput> {
  protected async handle(_: void, tx: TxClient): Promise<HealthOutput> {
    // tx is available — can run raw SQL if needed
    let database = 'up'
    try { await tx.execute(sql`SELECT 1`) } catch { database = 'down' }
    return { status: database === 'up' ? 'ok' : 'degraded', database, uptime: process.uptime(), timestamp: new Date().toISOString() }
  }
}
```

Rules:
- `@injectable()` always first
- Extend `BaseUseCase<TInput, TOutput>` — TInput can be `void` if no input
- Inject repos through constructor — no `@inject()` needed (abstract class = runtime token)
- `handle()` is `protected` — never called directly from outside
- `execute()` is what routes call — it wraps `handle()` in `db.transaction()`
- Throw `AppError(message, statusCode)` for domain/business errors
- Always pass `tx` to every repo call (not a standalone `db` call)

---

## Repository Implementation

**File**: `infrastructure/repositories/drizzle-{name}.repository.ts`

```typescript
import { injectable } from 'inversify'
import { eq } from 'drizzle-orm'
import type { TxClient } from '@project/db/src/client'
import { Users } from '@project/db/src/schema/iam.schema'
import { UserRole } from '@project/enums/src/user-role.enum'
import { AccountStatus } from '@project/enums/src/account-status.enum'
import { IUsersRepository } from '../../domain/interfaces/users.repository'
import type { IUser } from '../../domain/entities/user.entity'
import type { CreateUserInput } from '../../application/dtos/inputs/create-user.input'

type UserRow = typeof Users.$inferSelect

function toUser(row: UserRow): IUser {
  return {
    id:            row.id,
    email:         row.email,
    passwordHash:  row.passwordHash,
    role:          row.role as unknown as UserRole,
    accountStatus: row.accountStatus as unknown as AccountStatus,
    createdAt:     row.createdAt,
  }
}

@injectable()
export class DrizzleUsersRepository extends IUsersRepository {
  findById = async (id: string, tx: TxClient): Promise<IUser | null> => {
    const row = await tx.query.Users.findFirst({ where: eq(Users.id, id) })
    return row ? toUser(row) : null
  }

  findByEmail = async (email: string, tx: TxClient): Promise<IUser | null> => {
    const row = await tx.query.Users.findFirst({ where: eq(Users.email, email) })
    return row ? toUser(row) : null
  }

  create = async (data: CreateUserInput & { passwordHash: string }, tx: TxClient): Promise<IUser> => {
    const [row] = await tx.insert(Users).values({ email: data.email, passwordHash: data.passwordHash, role: data.role as UserRow['role'] }).returning()
    return toUser(row)
  }

  deactivate = async (id: string, tx: TxClient): Promise<void> => {
    await tx.update(Users).set({ accountStatus: 'inactive' }).where(eq(Users.id, id))
  }
}
```

Rules:
- `@injectable()` on the class
- Methods are arrow functions (not `async method()`) — matches `RepositoryMethod` type
- Always use `tx` parameter, never import `db` directly in repos
- Mapper function `to{Entity}(row)` at the top — keeps methods clean
- `type Row = typeof {Table}.$inferSelect` — typed from Drizzle schema

---

## Module

**File**: `{feature}.module.ts`

```typescript
import type { Container } from 'inversify'
import type { AppModule } from '~/common/ioc/kernel'
import { IUsersRepository }       from './domain/interfaces/users.repository'
import { DrizzleUsersRepository } from './infrastructure/repositories/drizzle-users.repository'
import { CreateUserUseCase }      from './application/usecases/create-user.usecase'
import { GetUserUseCase }         from './application/usecases/get-user.usecase'

export class UsersModule implements AppModule {
  load(container: Container): void {
    container.bind(IUsersRepository).to(DrizzleUsersRepository).inRequestScope()
    container.bind(CreateUserUseCase).toSelf().inRequestScope()
    container.bind(GetUserUseCase).toSelf().inRequestScope()
  }
}
```

Rules:
- Repositories: `.bind(IAbstract).to(Implementation).inRequestScope()`
- Use cases: `.toSelf().inRequestScope()` (no interface needed)
- Always `.inRequestScope()` — never singleton

---

## Routes

**File**: `presentation/{feature}.routes.ts`

```typescript
import { createRouter } from '~/common/ioc/elysia-base'
import { betterAuthPlugin } from '~/auth-plugin'
import { CreateUserUseCase } from '../application/usecases/create-user.usecase'
import { GetUserUseCase }    from '../application/usecases/get-user.usecase'
import { CreateUserInputSchema } from '../application/dtos/inputs/create-user.input'
import { GetUserParamsSchema }   from '../application/dtos/inputs/get-user.input'
import { UserOutputSchema }      from '../application/dtos/outputs/user.output'

export const usersRoutes = createRouter({ prefix: '/users' })
  .use(betterAuthPlugin)
  .post(
    '/',
    ({ container, body }) => container.get(CreateUserUseCase).execute(body),
    { body: CreateUserInputSchema, response: UserOutputSchema, auth: true },
  )
  .get(
    '/:id',
    ({ container, params }) => container.get(GetUserUseCase).execute(params),
    { params: GetUserParamsSchema, response: UserOutputSchema, auth: true },
  )
```

Rules:
- Use `createRouter({ prefix })` — never `new Elysia()` directly in modules
- `.use(betterAuthPlugin)` only if routes need auth
- `auth: true` on individual routes that require a valid session
- `container.get(UseCase).execute(input)` — this is the only pattern for invoking use cases
- Pass `body`, `params`, `query` directly as the `input` to `execute()`
- Routes return the Promise from `execute()` — Elysia handles serialization
