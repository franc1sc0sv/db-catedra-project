# FSD Layer Import Rules

Layers import only from layers **below** them. Slices within the same layer cannot import each other.

```
views     → widgets, features, entities, shared
widgets   → features, entities, shared
features  → entities, shared
entities  → shared
shared    → (nothing)
```

```ts
// Correct — widget imports from feature and entity (lower layers)
import { SignOutButton } from '@/features/auth'
import type { User } from '@/entities/user'

// Wrong — feature importing from another feature
import { SomeThing } from '@/features/other-feature'

// Wrong — entity importing from a feature
import { SomeForm } from '@/features/auth'
```

- Note: this project uses `src/views/` for the pages layer (not `src/pages/`), which conflicts with Next.js Pages Router
