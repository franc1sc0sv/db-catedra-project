---
name: Elysia.js + Eden
description: Build type-safe Bun/Node.js HTTP servers with Elysia and consume them with Eden's end-to-end type-safe client. Use when users mention Elysia, ElysiaJS, elysia server, bun backend, Eden Treaty, eden fetch, @elysiajs/eden, or need to create routes, plugins, middleware, validation, or a type-safe client for an Elysia API.
---

# Elysia.js Skill

Elysia is a TypeScript backend framework optimized for Bun with end-to-end type safety.

## Setup

```bash
bun create elysia app
cd app && bun dev        # localhost:3000
```

Manual install:
```bash
bun add elysia
```

Minimal server:
```typescript
import { Elysia } from 'elysia'

new Elysia()
  .get('/', 'Hello Elysia')
  .listen(3000)
```

## Core Patterns

### Routes & HTTP Methods

```typescript
new Elysia()
  .get('/users', handler)
  .post('/users', handler)
  .put('/users/:id', handler)
  .patch('/users/:id', handler)
  .delete('/users/:id', handler)
  .listen(3000)
```

### Context Properties

Available in every handler via destructuring:
- `body` — parsed request body
- `query` — query string as object
- `params` — path parameters
- `headers` — request headers
- `cookie` — cookie store (get/set)
- `set` — response mutators (`set.headers`, `set.status`, `set.redirect`)
- `status(code, value)` — return typed status response
- `redirect(url, status?)` — redirect response
- `store` — global mutable state

```typescript
.get('/users/:id', ({ params, query, status }) => {
  if (!params.id) return status(400, 'Missing id')
  return { id: params.id, page: query.page }
})
```

## Validation

See `references/validation.md` for full reference.

Elysia uses `t` (TypeBox-based) or any Standard Schema library (Zod, Valibot, ArkType):

```typescript
import { Elysia, t } from 'elysia'

new Elysia()
  .post('/login', ({ body }) => login(body), {
    body: t.Object({
      username: t.String(),
      password: t.String({ minLength: 8 })
    }),
    response: t.Object({ token: t.String() })
  })
```

Validated targets: `body`, `query`, `params`, `headers`, `cookie`, `response`.

## Plugins

See `references/plugins.md` for patterns.

```typescript
const userRouter = new Elysia({ prefix: '/users' })
  .get('/', getUsers)
  .post('/', createUser)

new Elysia()
  .use(userRouter)
  .listen(3000)
```

- `decorate(key, value)` — add properties to context
- `state(key, value)` — add to global mutable store
- `model(name, schema)` — register reusable schemas
- `guard({ body, headers }, app => app)` — apply schema to multiple routes

## Lifecycle Hooks

See `references/lifecycle.md` for full event order.

```typescript
new Elysia()
  .onRequest(({ request }) => { /* earliest */ })
  .onBeforeHandle(({ set }) => { /* auth, guards */ })
  .onAfterHandle(({ response }) => { /* transform response */ })
  .onError(({ code, error }) => { /* error handling */ })
```

Hook order matters — hooks only apply to routes registered **after** them.

## Error Handling

```typescript
new Elysia()
  .onError(({ code, error, set }) => {
    if (code === 'NOT_FOUND') return set.status = 404
    if (code === 'VALIDATION') return { message: error.message }
  })
```

Built-in codes: `NOT_FOUND`, `VALIDATION`, `PARSE`, `INTERNAL_SERVER_ERROR`, `UNKNOWN`.

## Eden (End-to-End Type Safety)

See `references/eden.md` for full reference — path mapping, error handling, SSE, testing.

```bash
bun add @elysiajs/eden
```

**Server** — export the type:
```typescript
// server.ts
export const app = new Elysia().get('/hi', () => 'Hello').listen(3000)
export type App = typeof app
```

**Client** — Eden Treaty:
```typescript
import { treaty } from '@elysiajs/eden'
import type { App } from './server'

const api = treaty<App>('localhost:3000')

// Path params use function call: /users/:id → api.users({ id: '1' }).get()
const { data, error } = await api.users({ id: '1' }).get()
if (error) return console.error(error.status, error.value)
console.log(data)
```

**Key rules:**
- Always destructure `{ data, error }` — one is always null
- Dynamic segments: `/users/:id` → `.users({ id: '1' })`
- GET has no body param: `api.users.get({ query: { page: 1 }, headers: {...} })`
- POST/PUT/PATCH: first arg is body, second is `{ query, headers, fetch }`

## Official Plugins

| Package | Purpose |
|---------|---------|
| `@elysiajs/swagger` | Auto-generate OpenAPI docs |
| `@elysiajs/cors` | CORS configuration |
| `@elysiajs/jwt` | JWT auth helpers |
| `@elysiajs/bearer` | Bearer token extraction |
| `@elysiajs/static` | Serve static files |
| `@elysiajs/html` | JSX/HTML responses |
| `@elysiajs/eden` | Type-safe client |

## Reference Files

- `references/eden.md` — Eden Treaty path mapping, params, error handling, SSE, testing, monorepo setup
- `references/validation.md` — full TypeBox/Standard Schema reference, guard, model reuse
- `references/lifecycle.md` — lifecycle event order, scope rules, hook patterns
- `references/plugins.md` — plugin authoring, scoping, decorate/state/model patterns, recommended file structure
