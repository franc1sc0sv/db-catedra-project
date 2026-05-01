# db-catedra-project

Medical clinic system built as a Turborepo monorepo. PostgreSQL + Drizzle ORM + Elysia.js (Bun runtime) + Next.js + Better Auth + Inversify DI + Vertical Slice Architecture.

## Tech Stack

| Layer | Tool |
|---|---|
| Monorepo | Turborepo + pnpm workspaces |
| API runtime | Bun + Elysia.js |
| Web runtime | Next.js (App Router) |
| Database | PostgreSQL 16 |
| ORM | Drizzle ORM + drizzle-kit |
| Auth | Better Auth (Drizzle adapter) |
| DI | Inversify (abstract-class tokens, no `@inject`) |
| Types | TypeBox DTOs → Eden Treaty end-to-end |

## Project Layout

```
.
├── apps/
│   ├── api/        # Elysia.js API (Bun)
│   └── web/        # Next.js frontend
├── packages/
│   ├── db/         # Drizzle schema, client, migrations, triggers, views
│   ├── auth/       # Better Auth server + React client
│   └── enums/      # Cross-cutting enums (UserRole, AccountStatus)
├── docker-compose.yml
├── turbo.json
└── pnpm-workspace.yaml
```

## Prerequisites

- Node.js **≥ 22**
- pnpm **10.33.0+** (`corepack enable` works)
- Bun (API runtime) — `curl -fsSL https://bun.sh/install | bash`
- Docker + Docker Compose (for Postgres)

## First-Time Setup

```bash
# 1. Install Bun (skip if already installed)
curl -fsSL https://bun.sh/install | bash

# 2. Install workspace dependencies
pnpm install

# 3. Create .env and generate Better Auth secret
cp .env.example .env
echo "BETTER_AUTH_SECRET=$(openssl rand -base64 32)" >> .env

# 4. Start Postgres on port 5435
docker compose up -d

# 5. Generate Drizzle migrations from the schema
pnpm db:generate

# 6. Apply migrations + triggers
pnpm db:migrate

# 7. Seed Better Auth users (admin / doctor / patient / receptionist)
pnpm --filter @project/api seed

# 8. Start API (http://localhost:3000) + Web (http://localhost:3001)
pnpm dev
```

### Test credentials

Seeded via `apps/api/src/seed-auth.ts`. Password for all accounts: `password123`.

| Role | Email |
|---|---|
| Admin | `admin@clinic.com` |
| Doctor | `dra.garcia@clinic.com`, `dr.martinez@clinic.com` |
| Receptionist | `recep1@clinic.com`, `recep2@clinic.com` |

New accounts registered via `/register` default to `patient`.

## Environment Variables

Copy `.env.example` → `.env` and fill in:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection (default points at `localhost:5435`) |
| `BETTER_AUTH_SECRET` | Min 32 chars. Generate with `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | API base URL — `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | Used by the web client |
| `NEXT_PUBLIC_WEB_URL` | Trusted origin for CSRF |

## Available Commands

Run from the repository root.

### Workspace-wide

```bash
pnpm dev                        # turbo dev — runs every app's dev task
pnpm dev:api                    # only the API (http://localhost:3000)
pnpm dev:web                    # only the web app (http://localhost:3001)
pnpm build                      # turbo build
pnpm --filter @project/api seed # populate Better Auth users (admin/doctor/receptionist)
```

### Database

```bash
pnpm db:generate    # drizzle-kit generate — emits SQL migrations
pnpm db:migrate     # apply migrations + run applyTriggers()
```

`db:migrate` runs `packages/db/src/migrate.ts`, which:
1. Executes every file in `packages/db/src/migrations/`
2. Creates the PostgreSQL trigger functions and triggers via `sql` tagged templates
3. Closes the connection pool (even on failure)

### Docker

```bash
docker compose up -d                                          # start Postgres on 5435
docker compose down                                           # stop
docker compose down -v                                        # stop + wipe data
docker compose exec postgres psql -U postgres -d db_catedra   # psql shell
docker compose logs -f postgres                               # follow logs
```

## Architecture Notes

### Vertical slices (`apps/api/src/modules/<slice>/`)

Each slice owns all its layers; no cross-module imports:

```
modules/users/
├── domain/
│   ├── entities/user.entity.ts
│   └── interfaces/users.repository.ts      # abstract class = DI token
├── application/
│   ├── dtos/
│   │   ├── inputs/*.input.ts               # TypeBox schema + Static<> type
│   │   └── outputs/*.output.ts
│   └── usecases/*.usecase.ts               # extends BaseUseCase
├── infrastructure/
│   └── repositories/drizzle-<slice>.repository.ts
├── presentation/<slice>.routes.ts
└── <slice>.module.ts                       # Inversify bindings
```

### Transaction-per-request

`BaseUseCase.execute()` wraps `handle()` in `db.transaction()`. Use cases never call `db.transaction` directly; repositories always take a `TxClient`.

### DI without `@inject`

Constructors use the abstract class type:

```ts
constructor(private readonly users: IUsersRepository) { super() }
```

`emitDecoratorMetadata: true` + `experimentalDecorators: true` makes TypeScript emit the abstract class as `design:paramtypes`; Inversify resolves it from the container automatically.

### No barrel files in app code

All imports are explicit file paths. The one exception is `packages/db/src/schema/index.ts`, which exists because the Drizzle client needs a single `schema` namespace.

### Single source of truth for identity

`packages/db/src/schema/iam.schema.ts` owns `Users`, `Sessions`, `Accounts`, `Verifications`. The business `Users` table doubles as Better Auth's `user` model — mapped via `drizzleAdapter(db, { schema: { user: Users, ... }})` in `packages/auth/src/auth.ts`.

### Frontend (`apps/web/src/`)

Feature-Sliced Design + Next.js App Router:

```
src/
├── app/                # Next.js routes
│   ├── (auth)/         # /login, /register — wrapped with requireGuest()
│   └── dashboard/      # requireAuth() in layout; per-role layouts use requireRole([...])
├── views/              # page-level compositions (DashboardAdmin, Login, etc.)
├── widgets/            # composite UI (DashboardNav, LandingHero)
├── features/           # interactive units (LoginForm, RegisterForm, SignOutButton)
├── entities/           # domain models + mappers (User, toUser)
├── shared/             # cross-cutting utilities
│   └── auth/           # getServerSession, guards.server.ts, authClient
├── components/ui/      # shadcn primitives
├── lib/                # helpers
└── proxy.ts            # Next.js 16 edge proxy (formerly middleware.ts)
```

### Auth flow

- **Client**: `packages/auth/src/auth-client.ts` exposes `signIn`, `signUp`, `signOut`, `useSession` via Better Auth's React client.
- **Server**: `packages/auth/src/auth.ts` is the single Better Auth instance used by both API (`apps/api`) and Next.js server components (`apps/web`). They share `BETTER_AUTH_SECRET` so session cookies signed by the API verify on the Next.js side.
- **Route guards** (`apps/web/src/shared/auth/guards.server.ts`):
  - `requireAuth()` — redirects to `/login` if no session.
  - `requireRole(roles)` — redirects to `/dashboard` if the session's role isn't allowed.
  - `requireGuest()` — redirects to `/dashboard` if a valid session exists.
- **Proxy** (`apps/web/src/proxy.ts`): does only a fast cookie-presence check on `/dashboard/*`. Full session validation happens in layouts/pages so a stale cookie can't create redirect loops.

### Env loading for Next.js

`apps/web/next.config.ts` calls `loadEnvConfig(path.resolve(__dirname, '../..'))` from `@next/env`, so Next.js picks up `BETTER_AUTH_SECRET`, `NEXT_PUBLIC_*`, etc. from the **root `.env`** — the same file `bun --env-file=../../.env` uses for the API.

## Reset / Troubleshooting

```bash
# Nuke the DB and start over
docker compose down -v
docker compose up -d
pnpm db:generate
pnpm db:migrate

# Rebuild deps from scratch
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install

# Check which Postgres tables exist
docker compose exec postgres psql -U postgres -d db_catedra -c '\dt'

# Check which Drizzle migrations have been applied
docker compose exec postgres psql -U postgres -d db_catedra \
  -c 'SELECT * FROM drizzle.__drizzle_migrations ORDER BY created_at;'
```

## Database Rubric Coverage

| Requirement | Location |
|---|---|
| Tables in CamelCase | `packages/db/src/schema/*.schema.ts` |
| Views | `packages/db/src/schema/views.ts` (Drizzle `pgView`) |
| Triggers | `packages/db/src/schema/triggers.ts` (`applyTriggers`) |
| Stored procedures | `packages/db/src/sql/03_stored_procedures.sql` |
| Subqueries | `packages/db/src/sql/04_subqueries.sql` |
| Roles | `packages/db/src/sql/05_roles.sql` |
| Seed (25+ rows/table) | `packages/db/src/sql/06_seed.sql` |
