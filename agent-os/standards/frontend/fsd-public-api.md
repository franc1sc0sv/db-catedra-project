# FSD Public API

Every slice (entity, feature, widget, view) must have an `index.ts` that is its **only** import point for other layers.

```ts
// entities/user/index.ts
export type { User } from './model/types'
export { loginSchema } from './model/schemas'
export type { LoginFormValues } from './model/schemas'
```

```ts
// Correct — import from slice root
import { loginSchema, type LoginFormValues } from '@/entities/user'

// Wrong — never import from internal paths
import { loginSchema } from '@/entities/user/model/schemas'
```

- All slices must have `index.ts`, no exceptions
- `index.ts` is the contract — only export what other layers need
- Internal files (model/, ui/, api/) are private to the slice
