# Elysia Plugins Reference

## Basic Plugin

Any Elysia instance can be a plugin:

```typescript
const userRouter = new Elysia({ prefix: '/users' })
  .get('/', getAllUsers)           // → GET /users
  .get('/:id', getUser)           // → GET /users/:id
  .post('/', createUser)          // → POST /users
  .put('/:id', updateUser)        // → PUT /users/:id
  .delete('/:id', deleteUser)     // → DELETE /users/:id

new Elysia()
  .use(userRouter)
  .listen(3000)
```

## Decorate — Add to Context

```typescript
const dbPlugin = new Elysia()
  .decorate('db', drizzle(connection))

new Elysia()
  .use(dbPlugin)
  .get('/users', ({ db }) => db.query.users.findMany())
```

## State — Global Mutable Store

```typescript
new Elysia()
  .state('counter', 0)
  .get('/count', ({ store }) => store.counter)
  .post('/increment', ({ store }) => ++store.counter)
```

## Model — Reusable Schemas

```typescript
const models = new Elysia()
  .model({
    user: t.Object({ id: t.Number(), name: t.String(), email: t.String() }),
    createUser: t.Object({ name: t.String(), email: t.String() }),
    error: t.Object({ message: t.String() })
  })

new Elysia()
  .use(models)
  .post('/users', ({ body }) => createUser(body), {
    body: 'createUser',
    response: { 201: 'user', 400: 'error' }
  })
```

## Guard — Shared Schema for Multiple Routes

```typescript
new Elysia()
  .guard(
    {
      headers: t.Object({ authorization: t.String() }),
      beforeHandle: ({ headers }) => verifyToken(headers.authorization)
    },
    (app) => app
      .get('/me', ({ headers }) => getUser(headers))
      .patch('/me', ({ body, headers }) => updateUser(body, headers), {
        body: t.Object({ name: t.String() })
      })
  )
```

## Recommended File Structure

```
src/
├── index.ts           # main Elysia app + listen()
├── plugins/
│   ├── db.ts          # database plugin (decorate)
│   └── auth.ts        # auth plugin (beforeHandle guard)
└── routes/
    ├── users.ts       # new Elysia({ prefix: '/users' })
    └── posts.ts       # new Elysia({ prefix: '/posts' })
```

```typescript
// src/index.ts
import { Elysia } from 'elysia'
import { dbPlugin } from './plugins/db'
import { authPlugin } from './plugins/auth'
import { usersRouter } from './routes/users'
import { postsRouter } from './routes/posts'

export const app = new Elysia()
  .use(dbPlugin)
  .use(authPlugin)
  .use(usersRouter)
  .use(postsRouter)
  .listen(3000)

export type App = typeof app
```

## Official Plugins

```bash
bun add @elysiajs/swagger   # Scalar / Swagger UI at /swagger
bun add @elysiajs/cors      # CORS
bun add @elysiajs/jwt       # JWT sign/verify helpers
bun add @elysiajs/bearer    # Extract Bearer token
bun add @elysiajs/static    # Serve static files
bun add @elysiajs/html      # JSX / HTML string responses
```

```typescript
import { swagger } from '@elysiajs/swagger'
import { cors } from '@elysiajs/cors'
import { jwt } from '@elysiajs/jwt'

new Elysia()
  .use(swagger({ path: '/docs' }))
  .use(cors({ origin: 'http://localhost:5173' }))
  .use(jwt({ name: 'jwt', secret: process.env.JWT_SECRET! }))
  .get('/token', ({ jwt }) => jwt.sign({ userId: 1 }))
```

## Scope — Lifecycle Isolation

Lifecycle events (hooks) in a plugin are **local by default** — they do not leak to parent instances.

```typescript
// ✅ Auth check stays inside this plugin only
const privateRoutes = new Elysia()
  .onBeforeHandle(({ cookie }) => checkAuth(cookie))
  .get('/dashboard', () => 'dashboard')

// To propagate to parent:
const authPlugin = new Elysia()
  .onBeforeHandle({ as: 'scoped' }, ({ cookie }) => checkAuth(cookie))
```

`decorate`, `state`, and `model` always propagate to the parent — only lifecycle (hooks) is isolated.
