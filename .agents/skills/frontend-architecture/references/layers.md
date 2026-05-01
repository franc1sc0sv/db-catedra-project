# Layer Reference

## shared/

**Rule:** Zero business logic. Zero domain concepts. No imports from any other `src/` layer.

### shared/api/
- One file: `client.ts` — Eden Treaty singleton
- Never call the API directly anywhere else

### shared/ui/
- Only generic, unstyled or lightly styled components
- No props that reference domain concepts (no `user`, no `course`)
- Examples: `Button`, `Input`, `Modal`, `Card`, `Skeleton`, `Badge`

### shared/lib/
- Pure functions only
- Examples: `cn()`, `formatDate()`, `formatCurrency()`, `validateEmail()`
- No side effects, no async

### shared/hooks/
- Framework-level hooks only
- Examples: `useDebounce`, `useMediaQuery`, `useLocalStorage`, `useClickOutside`

---

## entities/

**Rule:** Represents a business object. Dumb — no user interactions, no mutations, no API calls.

### Structure
```
entities/user/
├── model/
│   ├── user.types.ts      # TypeScript types/interfaces
│   ├── user.schema.ts     # Zod schemas for validation
│   └── index.ts
└── ui/
    ├── UserAvatar.tsx     # Display only, no onClick handlers
    ├── UserBadge.tsx
    └── index.ts
```

### Rules
- Components receive data via props — no fetching inside
- Types derived from API response types (`$inferSelect` from Drizzle or Eden response)
- No `useState` unless purely cosmetic (e.g., image fallback)

### Examples
- `entities/user/` — User type, UserAvatar, UserCard
- `entities/course/` — Course type, CourseChip, CourseBadge
- `entities/assignment/` — Assignment type, AssignmentStatusBadge

---

## features/

**Rule:** One user interaction = one feature slice. Self-contained. Has its own state, API calls, and Server Actions.

### Structure
```
features/auth/
├── ui/
│   ├── LoginForm.tsx        # 'use client'
│   └── RegisterForm.tsx
├── hooks/
│   ├── useLogin.ts          # TanStack Query mutation
│   └── useRegister.ts
├── actions/
│   ├── login.action.ts      # 'use server' — thin wrapper
│   └── register.action.ts
└── index.ts                 # Public exports only
```

### Server Action Pattern
```ts
'use server'
import { api } from '@/shared/api/client'
import { loginSchema } from '@/entities/user/model'

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.parse(Object.fromEntries(formData))
  const { data, error } = await api.auth.login.post(parsed)
  if (error) throw error
  return data
}
```

### Hook Pattern (TanStack Query)
```ts
'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { loginAction } from '../actions/login.action'

export function useLogin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: loginAction,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['session'] }),
  })
}
```

### Examples
- `features/auth/` — login, register, logout
- `features/course-enrollment/` — enroll, unenroll
- `features/assignment-submit/` — submit assignment
- `features/profile-edit/` — edit user profile

---

## widgets/

**Rule:** Composed sections — bring together features + entities. These are the "blocks" of a page.

### Structure
```
widgets/sidebar/
├── ui/
│   └── Sidebar.tsx      # Server Component that fetches + assembles
└── index.ts
```

### Pattern — Server Component widget with async data
```tsx
// widgets/course-list/ui/CourseList.tsx
import { api } from '@/shared/api/client'
import { CourseCard } from '@/entities/course/ui'
import { EnrollButton } from '@/features/course-enrollment'

export async function CourseList() {
  const { data: courses } = await api.courses.get()
  return (
    <ul>
      {courses?.map(c => (
        <li key={c.id}>
          <CourseCard course={c} />
          <EnrollButton courseId={c.id} />
        </li>
      ))}
    </ul>
  )
}
```

### Examples
- `widgets/header/` — nav + auth state
- `widgets/sidebar/` — nav links
- `widgets/course-list/` — list of courses with actions
- `widgets/assignment-table/` — paginated assignments

---

## pages/

**Rule:** Page-level assembly. Imports widgets, sets layout, defines Suspense boundaries.

### Structure
```
pages/dashboard/
├── ui/
│   └── DashboardPage.tsx   # Server Component
└── index.ts
```

### Pattern
```tsx
// pages/dashboard/ui/DashboardPage.tsx
import { Suspense } from 'react'
import { CourseList } from '@/widgets/course-list'
import { Skeleton } from '@/shared/ui'

export function DashboardPage() {
  return (
    <main>
      <h1>Dashboard</h1>
      <Suspense fallback={<Skeleton />}>
        <CourseList />
      </Suspense>
    </main>
  )
}
```

### app/ route file
```tsx
// app/(dashboard)/page.tsx
import { DashboardPage } from '@/pages/dashboard'
export default DashboardPage
```

---

## Import Path Aliases

Configure in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Usage: `import { api } from '@/shared/api/client'`
