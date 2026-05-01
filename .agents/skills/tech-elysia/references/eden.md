# Eden — End-to-End Type Safety

Eden connects a typed Elysia server to the client with zero code generation.

## Setup

```bash
bun add @elysiajs/eden
```

### Server — export the type

```typescript
// server.ts
import { Elysia, t } from 'elysia'

const app = new Elysia()
  .get('/hi', () => 'Hi Elysia')
  .get('/id/:id', ({ params: { id } }) => id)
  .post('/mirror', ({ body }) => body, {
    body: t.Object({ id: t.Number(), name: t.String() })
  })
  .listen(3000)

export type App = typeof app
```

### Client — Eden Treaty (recommended)

```typescript
// client.ts
import { treaty } from '@elysiajs/eden'
import type { App } from './server'

const api = treaty<App>('localhost:3000')

const { data, error } = await api.hi.get()
```

## Path Mapping

HTTP paths map to chained object properties:

| Server route | Treaty call |
|---|---|
| `/hi` | `api.hi.get()` |
| `/users` | `api.users.get()` |
| `/users/:id` | `api.users({ id: '1' }).get()` |
| `/users/:id/posts` | `api.users({ id: '1' }).posts.get()` |

Dynamic segments use a function call instead of a dot:

```typescript
// /item/:name
api.item({ name: 'Skadi' }).get()

// /item/:name/reviews
api.item({ name: 'Skadi' }).reviews.get()
```

## HTTP Methods

```typescript
api.users.get()
api.users.post({ name: 'Alice' })
api.users({ id: '1' }).put({ name: 'Bob' })
api.users({ id: '1' }).patch({ name: 'Charlie' })
api.users({ id: '1' }).delete()
```

## Parameters

### GET / HEAD — single options parameter

```typescript
api.hello.get({
  query: { page: 1, limit: 10 },
  headers: { authorization: 'Bearer token' },
  fetch: { cache: 'no-store' }  // native fetch options
})
```

### POST / PUT / PATCH — body first, options second

```typescript
api.users.post(
  { name: 'Alice', email: 'alice@example.com' },  // body
  {
    query: { notify: true },
    headers: { authorization: 'Bearer token' }
  }
)
```

## Error Handling

Every response is `{ data, error }`. Either `data` or `error` is non-null.

```typescript
const { data, error } = await api.users({ id: '1' }).get()

if (error) {
  // error.status — HTTP status code
  // error.value — typed error body (matches response schema)
  console.error(error.status, error.value)
  return
}

// data is now fully typed
console.log(data.name)
```

### Status-narrowed error handling

```typescript
const { data, error } = await api.users({ id: '1' }).get()

if (error) {
  switch (error.status) {
    case 404:
      console.log('Not found:', error.value)
      break
    case 401:
      console.log('Unauthorized')
      break
    default:
      throw error
  }
}
```

## Streaming (SSE) with Eden

Server uses a generator function:

```typescript
// server
new Elysia()
  .get('/events', function* () {
    yield 'message 1'
    yield 'message 2'
    yield 'message 3'
  })
```

Client uses `for await`:

```typescript
const { data, error } = await api.events.get()
if (error) throw error

for await (const chunk of data) {
  console.log(chunk)
}
```

## Eden Fetch (alternative)

Prefer Treaty. Use `edenFetch` only when you want fetch-like syntax:

```typescript
import { edenFetch } from '@elysiajs/eden'
import type { App } from './server'

const fetch = edenFetch<App>('http://localhost:3000')

const { data } = await fetch('/users/:id', {
  method: 'GET',
  params: { id: '1' },
  query: { include: 'posts' }
})
```

Note: `edenFetch` does not support WebSocket.

## Unit Testing with Eden Treaty

Pass the Elysia instance directly to `treaty` (no URL needed):

```typescript
import { describe, it, expect } from 'bun:test'
import { treaty } from '@elysiajs/eden'
import { app } from './server'

const api = treaty(app)  // no URL — direct instance

describe('GET /hi', () => {
  it('returns greeting', async () => {
    const { data, error } = await api.hi.get()
    expect(error).toBeNull()
    expect(data).toBe('Hi Elysia')
  })
})
```

## Turborepo / Monorepo Setup

In a monorepo, share the server type via a local package:

```typescript
// packages/api/index.ts
export { app } from './src/server'
export type { App } from './src/server'

// apps/web/src/api.ts
import { treaty } from '@elysiajs/eden'
import type { App } from '@repo/api'

export const api = treaty<App>(process.env.API_URL!)
```
