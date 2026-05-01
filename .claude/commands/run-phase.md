---
description: Orquestador. Dispara la phase indicada del workflow de ejecución, lanzando sub-agents en paralelo donde el plan lo permite.
argument-hint: <phase>  (1 | 2 | 3a | 3b | 4 | all)
---

# /run-phase

Ejecuta la fase `$ARGUMENTS` definida en `agent-os/execution-workflow.md`.

## Comportamiento por fase

### Phase 1 — DB Foundation (secuencial, 1 agente)
Lanza UN solo sub-agent (general-purpose) con el prompt:
> Implementa la spec `capa-datos/correcciones-schema` siguiendo `/run-spec capa-datos/correcciones-schema`. Reporta cuando typecheck + verify pasen.

Cuando termina exitosamente, **detente y avisa** al usuario antes de continuar a Phase 2.

### Phase 2 — DB Layer Extras (paralelo x4)
Lanza **4 sub-agents en una sola tool-call** (general-purpose):
- `capa-datos/procedimientos-almacenados`
- `capa-datos/subconsultas`
- `capa-datos/roles-postgresql`
- `capa-datos/datos-semilla`

Cada agente trabaja sobre `main` directamente — los archivos no colisionan (cada uno escribe a paths distintos en `packages/db/src/`).

Tras todos: corre `pnpm exec tsc --noEmit -p packages/db` y reporta.

### Phase 3a — Pre-scaffolding (secuencial, orquestador)
**No usa sub-agents.** El orquestador genera directamente:
1. `packages/db/src/views/daily-schedule.view.ts` (DailyScheduleView con `db.$with`/raw SQL).
2. `packages/db/src/views/index.ts` (barrel).
3. `apps/web/src/shared/api/client.ts` (Eden Treaty singleton si no existe).
4. `apps/web/src/shared/auth/guards.server.ts` y `guards.client.ts` (server/client guards reutilizables).
5. `apps/web/src/entities/{schedule-event,patient,medical-appointment,medical-record}/` con tipos shared (queries opcionales por entidad).
6. Marcadores en `apps/api/src/app.ts` y `apps/api/src/common/ioc/bootstrap.ts`:
   ```ts
   // <ROUTES_REGISTRATION_START>
   // <ROUTES_REGISTRATION_END>
   ```
   y
   ```ts
   // <MODULES_REGISTRATION_START>
   // <MODULES_REGISTRATION_END>
   ```

### Phase 3b — Feature Implementation (paralelo x3 worktrees)
Crea 3 git worktrees:
```bash
git worktree add worktrees/portal-paciente -b feat/portal-paciente
git worktree add worktrees/vista-doctora -b feat/vista-doctora
git worktree add worktrees/panel-secretaria -b feat/panel-secretaria
```

Lanza **3 sub-agents en una sola tool-call** con `isolation: "worktree"` (o trabajando en cada worktree path), cada uno con prompt secuencial:

- Worktree A — portal-paciente:
  > Implementa secuencialmente, en este orden, llamando a `/run-spec` para cada una:
  > 1. portal-paciente/registro-perfil
  > 2. portal-paciente/ver-disponibilidad
  > 3. portal-paciente/reservar-cita
  > 4. portal-paciente/mis-citas
  > Cada una debe pasar typecheck + verify-spec antes de pasar a la siguiente.

- Worktree B — vista-doctora:
  > 1. vista-doctora/configurar-horarios
  > 2. vista-doctora/agenda-hoy

- Worktree C — panel-secretaria:
  > 1. panel-secretaria/agenda-diaria
  > 2. panel-secretaria/bloquear-horarios

### Phase 4 — Merge + Final Verification (secuencial, orquestador)
1. Merge worktree A a main. Si conflicto, casi siempre será en `app.ts` o `bootstrap.ts` dentro de los marcadores: resuelve concatenando ambos lados.
2. Corre typecheck + lint global. Si falla, devuelve al worktree A para arreglo.
3. Repite para B y C.
4. Corre verificador para todas las 13 specs y reporta tabla final.

### Phase `all`
Encadena 1 → 2 → 3a → 3b → 4. **Pausa entre cada phase** y pide confirmación al usuario antes de avanzar.

## Salida

Reporte final (≤300 palabras): tabla de specs con status (PASS / FAIL / SKIPPED) y links a los commits de cada worktree.
