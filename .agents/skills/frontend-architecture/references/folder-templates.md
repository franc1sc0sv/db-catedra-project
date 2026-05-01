# Folder Templates

Copy-paste scaffolds for each FSD layer. Replace `<name>` with your slice name.

---

## Entity

```
src/entities/<name>/
├── model/
│   ├── <name>.types.ts
│   ├── <name>.schema.ts
│   └── index.ts
├── ui/
│   ├── <Name>Card.tsx
│   └── index.ts
└── index.ts
```

### model/\<name\>.types.ts
```ts
export interface <Name> {
  id: string
  // fields from API response
}
```

### model/\<name\>.schema.ts
```ts
import { z } from 'zod'

export const <name>Schema = z.object({
  id: z.string(),
})

export type <Name> = z.infer<typeof <name>Schema>
```

### model/index.ts
```ts
export * from './<name>.types'
export * from './<name>.schema'
```

### ui/\<Name\>Card.tsx
```tsx
import type { <Name> } from '../model'

interface <Name>CardProps {
  <name>: <Name>
}

export function <Name>Card({ <name> }: <Name>CardProps) {
  return (
    <div>
      <p>{<name>.id}</p>
    </div>
  )
}
```

### index.ts (public API)
```ts
export type { <Name> } from './model'
export { <Name>Card } from './ui/<Name>Card'
```

---

## Feature

```
src/features/<name>/
├── ui/
│   ├── <Name>Form.tsx
│   └── index.ts
├── hooks/
│   └── use<Name>.ts
├── actions/
│   └── <name>.action.ts
└── index.ts
```

### ui/\<Name\>Form.tsx
```tsx
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { use<Name> } from '../hooks/use<Name>'

export function <Name>Form() {
  const { mutate, isPending } = use<Name>()
  const form = useForm()

  return (
    <form onSubmit={form.handleSubmit(data => mutate(data))}>
      <button disabled={isPending}>Submit</button>
    </form>
  )
}
```

### hooks/use\<Name\>.ts
```ts
'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { <name>Action } from '../actions/<name>.action'

export function use<Name>() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: <name>Action,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['<name>'] }),
  })
}
```

### actions/\<name\>.action.ts
```ts
'use server'
import { api } from '@/shared/api/client'

export async function <name>Action(data: unknown) {
  const { data: result, error } = await api.<name>.post(data)
  if (error) throw new Error(error.value?.message ?? 'Unknown error')
  return result
}
```

### index.ts (public API)
```ts
export { <Name>Form } from './ui/<Name>Form'
export { use<Name> } from './hooks/use<Name>'
```

---

## Widget

```
src/widgets/<name>/
├── ui/
│   ├── <Name>Widget.tsx
│   └── <Name>Skeleton.tsx
└── index.ts
```

### ui/\<Name\>Widget.tsx
```tsx
import { api } from '@/shared/api/client'

export async function <Name>Widget() {
  const { data, error } = await api.<name>.get()
  if (error) throw error

  return (
    <section>
      {/* render data */}
    </section>
  )
}
```

### ui/\<Name\>Skeleton.tsx
```tsx
export function <Name>Skeleton() {
  return <div className="animate-pulse h-32 bg-muted rounded-lg" />
}
```

### index.ts
```ts
export { <Name>Widget } from './ui/<Name>Widget'
export { <Name>Skeleton } from './ui/<Name>Skeleton'
```

---

## Page

```
src/pages/<name>/
├── ui/
│   └── <Name>Page.tsx
└── index.ts
```

### ui/\<Name\>Page.tsx
```tsx
import { Suspense } from 'react'
import { <Name>Widget, <Name>Skeleton } from '@/widgets/<name>'

export function <Name>Page() {
  return (
    <main className="container mx-auto py-8">
      <Suspense fallback={<<Name>Skeleton />}>
        <<Name>Widget />
      </Suspense>
    </main>
  )
}
```

### index.ts
```ts
export { <Name>Page } from './ui/<Name>Page'
```

### app/ route file
```tsx
// app/(dashboard)/<name>/page.tsx
import { <Name>Page } from '@/pages/<name>'
export default <Name>Page
```

---

## shared/ui Component

```
src/shared/ui/<Name>/
├── <Name>.tsx
└── index.ts
```

### \<Name\>.tsx
```tsx
import { cn } from '@/shared/lib/cn'

interface <Name>Props extends React.HTMLAttributes<HTMLDivElement> {
  // props
}

export function <Name>({ className, ...props }: <Name>Props) {
  return <div className={cn('', className)} {...props} />
}
```

### index.ts
```ts
export { <Name> } from './<Name>'
```
