---
name: Next.js + Elysia Client (Eden Treaty)
description: >
  Connect the Next.js frontend (apps/web) to the standalone Elysia API (apps/api)
  using Eden Treaty for end-to-end type safety in this Turborepo monorepo.
  Use when: calling the Elysia API from Next.js, setting up the Eden Treaty client
  singleton, fetching data in Server Components or Client Components, writing
  Server Actions that call the API, creating Route Handlers that proxy the API,
  configuring NEXT_PUBLIC_API_URL, handling { data, error } responses in Next.js,
  or asked "how do I call the API from the frontend", "how do I use Eden in Next.js",
  "type-safe API client in Next.js", "clientApi", "api.ts in lib".
  Do NOT use for building Elysia routes (use backend-architecture or tech-elysia).
---

# Next.js + Elysia Client (Eden Treaty)

Eden Treaty is the type-safe client for Elysia — the equivalent of tRPC in this stack. No code generation, full type inference from server to component.

## Prerequisites

This skill covers consumption only. For building the API:
- Elysia server setup + Eden basics → `tech-elysia/SKILL.md`
- Eden path mapping + `{ data, error }` API → `tech-elysia/references/eden.md`
- Route/module structure → `backend-architecture/SKILL.md`

## 1. Type Sharing

The `App` type lives in `apps/api/src/app.ts`:

```typescript
export const app = new Elysia(...)
export type App = typeof app
```

Add `@project/api` as a workspace dependency in `apps/web/package.json`:

```json
{
  "dependencies": {
    "@project/api": "workspace:*"
  }
}
```

Then run `pnpm install` from the repo root.

> **Only ever import the type** — never the runtime value. Importing `app` at runtime would pull Bun/Inversify into the Next.js bundle and break the build.

```typescript
import type { App } from '@project/api/src/app'   // ✅ type only
import { app } from '@project/api/src/app'         // ❌ never do this
```

## 2. Eden Treaty Client Singleton

Create `apps/web/src/lib/api.ts`:

```typescript
import { treaty } from '@elysiajs/eden'
import type { App } from '@project/api/src/app'

// Server-side: Server Components, Server Actions, Route Handlers
export const api = treaty<App>(process.env.API_URL!)

// Client-side: Client Components (browser)
export const clientApi = treaty<App>(process.env.NEXT_PUBLIC_API_URL!)
```

Add `@elysiajs/eden` to `apps/web/package.json` (not `apps/api`):

```bash
cd apps/web && bun add @elysiajs/eden
```

Environment variables in `apps/web/.env.local`:

```
API_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 3. Usage Patterns

### Server Components

Use `api` — plain `await`, no hooks. Full type inference from route schema.

```typescript
import { api } from '@/lib/api'

export default async function UsersPage() {
  const { data, error } = await api.users.get()
  if (error) throw new Error(`API error ${error.status}`)
  return <ul>{data.map(u => <li key={u.id}>{u.name}</li>)}</ul>
}
```

Next.js cache control via the `fetch` option:

```typescript
// ISR — revalidate every 60 seconds
api.users.get({ fetch: { next: { revalidate: 60 } } })

// No cache
api.users.get({ fetch: { cache: 'no-store' } })
```

### Client Components

Use `clientApi` — `process.env.NEXT_PUBLIC_API_URL` is available in the browser.

```typescript
'use client'
import { useEffect, useState } from 'react'
import { clientApi } from '@/lib/api'
import type { UserOutput } from '@project/api/src/modules/users/application/dtos/outputs/user.output'

export function UsersList() {
  const [users, setUsers] = useState<UserOutput[]>([])

  useEffect(() => {
    clientApi.users.get().then(({ data, error }) => {
      if (error) return console.error(error.status, error.value)
      setUsers(data)
    })
  }, [])

  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>
}
```

### Server Actions

Use `api` — Server Actions run on the server.

```typescript
'use server'
import { api } from '@/lib/api'

export async function createUser(input: { name: string; email: string }) {
  const { data, error } = await api.users.post(input)
  if (error) throw new Error(error.value?.message ?? 'API error')
  return data
}
```

Calling from a Client Component:

```typescript
'use client'
import { createUser } from '@/actions/users'

export function CreateUserForm() {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    await createUser({ name: form.get('name') as string, email: form.get('email') as string })
  }
  return <form onSubmit={handleSubmit}>...</form>
}
```

### Route Handlers

Proxy pattern — only needed for webhooks or when a browser client must hit `/api/…` directly. Prefer Server Actions for mutations.

```typescript
// apps/web/src/app/api/users/route.ts
import { api } from '@/lib/api'
import { NextResponse } from 'next/server'

export async function GET() {
  const { data, error } = await api.users.get()
  if (error) return NextResponse.json(error.value, { status: error.status })
  return NextResponse.json(data)
}
```

## 4. Error Handling

Always destructure `{ data, error }` — one is always null.

| Context | Error strategy |
|---|---|
| Server Component | `throw error` → triggers `error.tsx` boundary |
| Server Action | `throw` or return `{ success: false, error: string }` |
| Client Component | set error state, show UI feedback |

```typescript
const { data, error } = await api.users({ id }).get()

if (error) {
  switch (error.status) {
    case 404: return notFound()       // Next.js notFound()
    case 401: redirect('/login')      // Next.js redirect()
    default: throw new Error(String(error.value))
  }
}
```

## 5. Anti-Patterns

| Don't | Why |
|---|---|
| `import { app } from '@project/api/src/app'` | Pulls Bun runtime into Next.js bundle |
| `app/api/[[...slugs]]/route.ts` with Elysia handler | This project runs a standalone API — don't embed Elysia inside Next.js |
| Use `api` in `'use client'` files | `API_URL` is undefined in the browser — use `clientApi` |
| Use `clientApi` in Server Components/Actions | Unnecessary; prefer `api` which can use internal URLs |
