# Entity Schemas

Zod schemas and their inferred types belong in `entities/[name]/model/schemas.ts`. Schemas are domain knowledge, not feature-specific — multiple features may use the same schema.

```ts
// entities/user/model/schemas.ts
export const loginSchema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})
export type LoginFormValues = z.infer<typeof loginSchema>
```

Features consume schemas from the entity public API:
```ts
// features/auth/ui/LoginForm.tsx
import { loginSchema, type LoginFormValues } from '@/entities/user'
```

- Never define schemas inside a feature or widget
- Export both the schema and its inferred type from `index.ts`
