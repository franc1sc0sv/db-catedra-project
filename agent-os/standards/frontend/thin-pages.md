# Thin Next.js Pages

`page.tsx` is framework glue only. It parses Next.js-specific params and renders exactly one view component. No JSX, no logic, no data fetching lives here.

```tsx
// app/(auth)/login/page.tsx
import { LoginPage } from '@/views/login'

export default async function LoginRoute({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>
}) {
  const { registered } = await searchParams
  return <LoginPage registered={registered === '1'} />
}
```

- One `page.tsx` → one view component, always
- View component lives in `src/views/[page-name]/ui/[PageName]Page.tsx`
- Data fetching, auth guards, and UI logic go in the view, not the page file
