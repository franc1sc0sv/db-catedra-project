# Elysia Validation Reference

## TypeBox (`t`) — Built-in

```typescript
import { Elysia, t } from 'elysia'
```

### Common Types

```typescript
t.String()
t.String({ minLength: 1, maxLength: 100 })
t.Number()
t.Number({ minimum: 0 })
t.Boolean()
t.Array(t.String())
t.Object({ key: t.String() })
t.Optional(t.String())       // field may be omitted
t.Nullable(t.String())       // field may be null
t.Union([t.String(), t.Number()])
t.Literal('admin')
t.Enum({ A: 'a', B: 'b' })
t.Date()
t.Any()
```

### Validation Targets

```typescript
.post('/route', handler, {
  body: t.Object({...}),
  query: t.Object({ page: t.Optional(t.Number()) }),
  params: t.Object({ id: t.Number() }),
  headers: t.Object({ authorization: t.String() }),
  cookie: t.Object({ session: t.String() }),
  response: t.Object({...})   // validates handler return type
})
```

### Standard Schema (Zod, Valibot, etc.)

```typescript
import { z } from 'zod'
import * as v from 'valibot'

new Elysia()
  .post('/zod', handler, {
    body: z.object({ username: z.string() })
  })
  .post('/valibot', handler, {
    body: v.object({ username: v.string() })
  })
```

### Reusable Models via `.model()`

```typescript
new Elysia()
  .model({
    user: t.Object({ username: t.String(), password: t.String() })
  })
  .post('/login', ({ body }) => body, { body: 'user', response: 'user' })
  .post('/register', ({ body }) => body, { body: 'user' })
```

### Guard — Apply Schema to Multiple Routes

```typescript
new Elysia()
  .guard(
    { body: t.Object({ username: t.String(), password: t.String() }) },
    (app) => app
      .post('/sign-up', ({ body }) => signUp(body))
      .post('/sign-in', ({ body }) => signIn(body))
  )
```

### Per-Route Response Status Types

```typescript
.get('/user/:id', ({ params, status }) => {
  const user = db.find(params.id)
  if (!user) return status(404, { message: 'Not found' })
  return user
}, {
  response: {
    200: t.Object({ id: t.String(), name: t.String() }),
    404: t.Object({ message: t.String() })
  }
})
```
