---
name: frontend-architecture
description: >
  Feature-Sliced Design (FSD) architecture for Next.js App Router frontend. Use when creating
  new pages, features, widgets, or entities in apps/web; when deciding where a component or
  hook belongs; when asked "where should I put X", "create a new feature", "scaffold a page",
  "add a widget", or "set up the frontend structure". Also triggers on: new module, feature folder,
  page scaffold, FSD layer, frontend boilerplate, frontend architecture, Next.js folder structure.
---

# Frontend Architecture — Feature-Sliced Design + Next.js App Router

This project's frontend (`apps/web`) uses **Feature-Sliced Design (FSD)** adapted for Next.js App Router.

## Core Rule

> `app/` = routing only. All business logic lives in `src/`.

## Layer Hierarchy (top → bottom, dependencies flow downward only)

```
pages   → widgets → features → entities → shared
```

Each layer may only import from layers **below** it. Never import upward.

## Directory Map

```
apps/web/
├── app/                          # Next.js routing ONLY
│   ├── (auth)/
│   │   ├── login/page.tsx        # imports from src/pages/login
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   └── [feature]/page.tsx
│   ├── layout.tsx                # Root layout + providers
│   └── providers.tsx             # 'use client' — all context providers
│
└── src/
    ├── shared/                   # Zero business logic
    │   ├── api/                  # Eden Treaty client singleton
    │   │   └── client.ts
    │   ├── ui/                   # Generic, reusable UI (Button, Input, Modal)
    │   ├── lib/                  # Pure utilities: formatters, validators, cn()
    │   └── hooks/                # Generic hooks: useDebounce, useLocalStorage
    │
    ├── entities/                 # Core domain objects — no side effects
    │   └── <entity>/
    │       ├── model/            # Types, zod schemas, constants
    │       └── ui/               # Dumb display components: UserCard, CourseChip
    │
    ├── features/                 # Self-contained user interactions
    │   └── <feature>/
    │       ├── ui/               # Interactive components (forms, buttons)
    │       ├── hooks/            # Feature-scoped hooks (TanStack Query)
    │       ├── actions/          # Server Actions (thin: validate → API → return)
    │       └── index.ts          # Public API — only export what consumers need
    │
    ├── widgets/                  # Page sections composed from features + entities
    │   └── <widget>/
    │       ├── ui/               # The assembled section component
    │       └── index.ts
    │
    └── pages/                    # Full page components (assembled from widgets)
        └── <page>/
            ├── ui/               # Page component (Server Component)
            └── index.ts
```

## Placement Decision

| What you're creating | Where it goes |
|---|---|
| Route file | `app/` |
| Generic reusable component (Button, Input) | `shared/ui/` |
| Generic utility (format date, cn) | `shared/lib/` |
| API client setup | `shared/api/` |
| A business object type + its display card | `entities/<name>/` |
| A user action (login form, enroll button) | `features/<name>/` |
| A page section with multiple features | `widgets/<name>/` |
| A full page assembled from widgets | `pages/<name>/` |

## Server vs Client Decision

| Use Server Component | Use Client Component |
|---|---|
| Fetching data (Server Action or direct) | `useState`, `useEffect`, hooks |
| Page shells and layouts | Forms, event handlers |
| Widgets that wrap async data | Interactive UI |
| `pages/` layer | `features/*/ui/` |

Mark client components with `'use client'` at the top. Never add it to page shells or layout wrappers.

## Step-by-Step: Creating a New Feature

1. Create `src/features/<name>/`
2. Add `model/` types (or reuse from `entities/`)
3. Add `ui/<Name>Form.tsx` or `ui/<Name>Button.tsx` with `'use client'`
4. Add `hooks/use<Name>.ts` using TanStack Query or Better Auth client
5. Add `actions/<name>.action.ts` as a Server Action (thin wrapper)
6. Export public API via `index.ts`
7. Compose into a widget or page

## Step-by-Step: Creating a New Page

1. Create `src/pages/<name>/ui/<Name>Page.tsx` (Server Component)
2. Import widgets into the page component
3. Create `app/<route>/page.tsx` and import from `src/pages/<name>`

## Eden Treaty Integration

API calls always go through `shared/api/client.ts`. See `next-elysia-client` skill for client setup.

```ts
// src/shared/api/client.ts
import { treaty } from '@elysiajs/eden'
import type { App } from '@api/app'

export const api = treaty<App>(process.env.NEXT_PUBLIC_API_URL!)
```

Use in Server Actions (server-side calls):
```ts
// src/features/auth/actions/login.action.ts
'use server'
import { api } from '@/shared/api/client'

export async function loginAction(data: LoginDto) {
  const { data: result, error } = await api.auth.login.post(data)
  if (error) throw new Error(error.message)
  return result
}
```

Use in hooks (client-side):
```ts
// src/features/auth/hooks/useLogin.ts
import { useMutation } from '@tanstack/react-query'
import { loginAction } from '../actions/login.action'

export function useLogin() {
  return useMutation({ mutationFn: loginAction })
}
```

## index.ts Public API Pattern

Every slice exposes only what consumers need:

```ts
// src/features/auth/index.ts
export { LoginForm } from './ui/LoginForm'
export { useLogin } from './hooks/useLogin'
// Do NOT export internal implementation details
```

## Reference Files

- `references/layers.md` — detailed rules and examples per layer
- `references/patterns.md` — common patterns: data fetching, forms, modals, auth guards
- `references/folder-templates.md` — copy-paste folder scaffolds for each layer type
