---
description: Implementa una spec de agent-os/specs/, ejecuta typecheck + lint + verifier, y solo cierra la tarea cuando todo pasa
argument-hint: <domain>/<feature>  (ej. portal-paciente/reservar-cita)
---

# /run-spec

Implementa la spec `$ARGUMENTS` siguiendo las skills del proyecto y el workflow definido en `agent-os/execution-workflow.md`.

## Contexto obligatorio antes de empezar

Lee siempre, en orden:

1. `agent-os/specs/$ARGUMENTS/spec.md` — qué hace la feature
2. `agent-os/specs/$ARGUMENTS/shape.md` — decisiones de diseño
3. `agent-os/specs/$ARGUMENTS/tasks.md` — checklist a completar
4. `agent-os/specs/$ARGUMENTS/standards.md` — reglas duras
5. `agent-os/specs/$ARGUMENTS/references.md` — archivos relevantes
6. `agent-os/execution-workflow.md` — para no romper zonas compartidas

Si la spec depende de otra (ver dependency map del workflow) y la dependencia no está implementada, **detente y pídelo al usuario**.

## Skills que debes activar según la capa

| Tipo de spec | Skills |
|---|---|
| capa-datos (schema) | `tech-drizzle` |
| capa-datos (SQL/SP/RLS) | `tech-drizzle` + lectura directa de SQL |
| API (Elysia + Inversify) | `backend-architecture`, `tech-elysia` |
| Frontend (Next.js + FSD) | `frontend-architecture`, `next-best-practices`, `next-elysia-client`, `vercel-react-best-practices`, `tailwind-css-patterns` |
| Auth | `better-auth-best-practices`, `email-and-password-best-practices` |

## Reglas duras (no negociables)

1. **Cada componente UI viene de shadcn/ui** (`@/components/ui/...`). Si no existe el primitive, instálalo con:
   `pnpm dlx shadcn@canary add <component>` desde `apps/web`.
2. **Memoria del proyecto**: ya sabes que en este repo:
   - FSD pages layer es `src/views/`, NO `src/pages/`.
   - El `Button` de shadcn canary no tiene `asChild` — usa `buttonVariants` className en `<Link>`.
   - `apps/web/tsconfig.json` mapea `~/*` → `../api/src/*`.
3. **No crear tests** (out of scope).
4. **Idioma**: textos visibles en español, código en inglés.
5. **Append-only en zonas compartidas**: `apps/api/src/app.ts` y `apps/api/src/common/ioc/bootstrap.ts` se modifican añadiendo al final del bloque correspondiente, nunca reescribiendo.

## Pipeline de cierre (BLOQUEANTE)

Antes de marcar la spec como completada en `tasks.md`, debe pasar **en este orden**:

1. **Typecheck**:
   ```bash
   pnpm exec tsc --noEmit -p apps/web
   pnpm exec tsc --noEmit -p apps/api
   pnpm exec tsc --noEmit -p packages/db
   ```
   Si tu spec solo toca un proyecto, corre solo ese. Si toca capa-datos, corre packages/db obligatorio.

2. **Lint** (solo si tocas `apps/web`):
   ```bash
   cd apps/web && pnpm lint
   ```

3. **Verificador**: invoca `/verify-spec $ARGUMENTS`. Si reporta missing items, vuelve a implementar y reintenta.

Solo cuando los 3 pasos pasan, actualiza `agent-os/specs/$ARGUMENTS/tasks.md` cambiando los `[ ]` a `[x]` correspondientes y agrega al final una línea:
`> Implementación completada: <fecha-iso>`

## Salida esperada

Reporte final breve (≤200 palabras):
- Archivos creados/modificados (rutas relativas)
- Endpoints API añadidos
- Rutas frontend añadidas
- Resultado typecheck/lint/verify (✓ o ✗ con detalle)
