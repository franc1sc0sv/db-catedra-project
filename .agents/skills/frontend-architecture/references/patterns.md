# Common Patterns

## Auth Guard (middleware-based)

```ts
// middleware.ts (app root)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('better-auth.session_token')
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
```

---

## Form with Server Action

```tsx
// features/auth/ui/LoginForm.tsx
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '@/entities/user/model'
import { useLogin } from '../hooks/useLogin'

export function LoginForm() {
  const { mutate, isPending, error } = useLogin()
  const form = useForm({ resolver: zodResolver(loginSchema) })

  return (
    <form onSubmit={form.handleSubmit(data => mutate(data))}>
      <input {...form.register('email')} />
      <input {...form.register('password')} type="password" />
      {error && <p>{error.message}</p>}
      <button disabled={isPending}>
        {isPending ? 'Logging in...' : 'Log in'}
      </button>
    </form>
  )
}
```

---

## Server Component Data Fetching

```tsx
// widgets/course-list/ui/CourseList.tsx
import { api } from '@/shared/api/client'
import { CourseCard } from '@/entities/course/ui'

export async function CourseList() {
  const { data: courses, error } = await api.courses.get()
  if (error) throw error

  return (
    <section>
      {courses.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}
    </section>
  )
}
```

---

## TanStack Query — Query

```ts
// features/course-enrollment/hooks/useCourses.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api/client'

export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await api.courses.get()
      if (error) throw error
      return data
    },
  })
}
```

---

## TanStack Query — Mutation with Optimistic Update

```ts
// features/course-enrollment/hooks/useEnroll.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { enrollAction } from '../actions/enroll.action'

export function useEnroll() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (courseId: string) => enrollAction(courseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['courses'] })
      qc.invalidateQueries({ queryKey: ['enrollments'] })
    },
  })
}
```

---

## Suspense + Loading Boundary

```tsx
// pages/dashboard/ui/DashboardPage.tsx
import { Suspense } from 'react'
import { CourseList } from '@/widgets/course-list'
import { CourseListSkeleton } from '@/widgets/course-list'

export function DashboardPage() {
  return (
    <main className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <Suspense fallback={<CourseListSkeleton />}>
        <CourseList />
      </Suspense>
    </main>
  )
}
```

---

## Modal Pattern

Keep modals in the feature that owns them:

```
features/course-enrollment/
├── ui/
│   ├── EnrollButton.tsx       # Opens modal
│   └── EnrollConfirmModal.tsx # Modal itself
└── hooks/
    └── useEnrollModal.ts      # Modal open/close state
```

```ts
// features/course-enrollment/hooks/useEnrollModal.ts
import { useState } from 'react'

export function useEnrollModal() {
  const [open, setOpen] = useState(false)
  return { open, onOpen: () => setOpen(true), onClose: () => setOpen(false) }
}
```

---

## QueryClient Provider (providers.tsx)

```tsx
// app/providers.tsx
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(() => new QueryClient())
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}
```

```tsx
// app/layout.tsx
import { Providers } from './providers'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

---

## Error Handling in Server Actions

```ts
// src/shared/lib/action-error.ts
export class ActionError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
  }
}

// In action:
export async function enrollAction(courseId: string) {
  const { data, error } = await api.courses[courseId].enroll.post()
  if (error) throw new ActionError(error.value.message, 'ENROLL_FAILED')
  return data
}
```
