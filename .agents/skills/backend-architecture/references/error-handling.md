# Error Handling

## AppError

```typescript
// common/errors/app-error.ts
export class AppError extends Error {
  constructor(
    public override readonly message: string,
    public readonly statusCode: number = 400,
  ) {
    super(message)
    this.name = 'AppError'
  }
}
```

Throw `AppError` inside use cases for all expected business/domain errors:

```typescript
throw new AppError('Email already in use', 409)
throw new AppError('User not found', 404)
throw new AppError('Insufficient permissions', 403)
throw new AppError('Invalid input', 400)
```

## Global Handler (app.ts)

```typescript
.onError(({ error }) => {
  if (error instanceof AppError) {
    return Response.json({ message: error.message }, { status: error.statusCode })
  }
  // non-AppError errors bubble up as 500
})
```

The global handler is already wired in `app.ts`. All `AppError` instances are caught automatically and returned as `{ message }` JSON with the correct HTTP status.

## Auth Errors

The `betterAuthPlugin` macro handles auth via:
```typescript
.macro({
  auth: {
    async resolve({ status, request: { headers } }) {
      const session = await auth.api.getSession({ headers })
      if (!session) return status(401)
      return { user: session.user, session: session.session }
    },
  },
})
```

Adding `auth: true` to a route option automatically calls this resolver. No need to check auth manually inside use cases.

## Common Status Codes

| Scenario | Code |
|---|---|
| Success (default) | 200 |
| Created | 201 |
| Bad request / validation | 400 |
| Unauthenticated | 401 |
| Forbidden | 403 |
| Not found | 404 |
| Conflict (duplicate) | 409 |
| Server error | 500 |

## Pattern — Never throw inside routes

All business errors go inside `handle()` in the use case. Routes only call `execute()` — they never catch or rethrow.

```typescript
// ✅ correct
protected async handle(input, tx) {
  const existing = await this.repo.findByEmail(input.email, tx)
  if (existing) throw new AppError('Email already in use', 409)
  ...
}

// ❌ never do this in routes
.post('/', async ({ container, body }) => {
  try {
    return await container.get(CreateUserUseCase).execute(body)
  } catch (e) {
    // don't catch here — let app.ts handle it
  }
})
```
