# Execution Workflow — Parallel Spec Implementation

Maestro doc para ejecutar las 13 specs en `agent-os/specs/` con sub-agents en paralelo, sin colisiones, con verificación automática por spec.

## Reglas globales

- **UI**: cada componente del frontend usa shadcn/ui (`@/components/ui/*`). Si un primitive no existe, instalarlo con `pnpm dlx shadcn@canary add <component>` antes de usarlo.
- **Después de cada spec**: typecheck + lint + verificador de implementación. Si algo falla, el agente corrige antes de marcar la spec completada.
- **Out of scope**: tests (no unit, no e2e, no integration).
- **Idioma**: textos visibles al usuario en español; código en inglés.

## Inventario de specs

| Domain | Spec | Capa |
|---|---|---|
| capa-datos | correcciones-schema | DB schema |
| capa-datos | procedimientos-almacenados | DB SQL |
| capa-datos | subconsultas | DB queries |
| capa-datos | roles-postgresql | DB roles + RLS |
| capa-datos | datos-semilla | DB seed |
| portal-paciente | registro-perfil | API + Web |
| portal-paciente | ver-disponibilidad | API + Web |
| portal-paciente | reservar-cita | API + Web |
| portal-paciente | mis-citas | API + Web |
| vista-doctora | configurar-horarios | API + Web |
| vista-doctora | agenda-hoy | API + Web |
| panel-secretaria | agenda-diaria | API + Web |
| panel-secretaria | bloquear-horarios | API + Web |

## Mapa de dependencias

```
[Phase 1] correcciones-schema  (hard blocker)
              │
              ├── [Phase 2 — paralelo x4]
              │     ├── procedimientos-almacenados
              │     ├── subconsultas
              │     ├── roles-postgresql
              │     └── datos-semilla
              │
              ├── [Phase 3a — pre-scaffolding, secuencial]
              │     ├── DailyScheduleView (packages/db/src/views/)
              │     ├── Eden client singleton + auth guards
              │     └── FSD entities compartidas (schedule-event, patient,
              │           medical-appointment, medical-record)
              │
              └── [Phase 3b — paralelo x3 worktrees, secuencial dentro de cada uno]
                    ├── Worktree A — portal-paciente (4 specs)
                    │     registro-perfil → ver-disponibilidad
                    │       → reservar-cita → mis-citas
                    ├── Worktree B — vista-doctora (2 specs)
                    │     configurar-horarios → agenda-hoy
                    └── Worktree C — panel-secretaria (2 specs)
                          agenda-diaria → bloquear-horarios
```

## Zonas de conflicto identificadas

Estos archivos son tocados por múltiples specs y requieren manejo coordinado:

| Archivo | Conflicto | Estrategia |
|---|---|---|
| `apps/api/src/app.ts` | Cada módulo añade `.use(xxxRoutes)` | Pre-scaffold con marcador `// REGISTER ROUTES` y append-only por sub-agent. Merger consolida al final. |
| `apps/api/src/common/ioc/bootstrap.ts` | Cada módulo añade `new XModule()` al array | Mismo patrón append-only |
| `packages/db/src/schema/index.ts` | Re-export barrel | Solo `correcciones-schema` y `Phase 3a` lo tocan |
| `packages/db/src/views/index.ts` | DailyScheduleView compartida | Creada en Phase 3a, solo lectura para Phase 3b |
| `apps/web/src/shared/api/client.ts` | Eden client singleton | Creado en Phase 3a, solo lectura |
| `apps/web/src/entities/*` | Tipos/queries compartidos | Pre-scaffolded en Phase 3a; agentes solo añaden campos no presentes |

## Aislamiento por worktree

Phase 3b corre 3 worktrees git en paralelo:

- Worktree A: `worktrees/portal-paciente` (branch `feat/portal-paciente`)
- Worktree B: `worktrees/vista-doctora` (branch `feat/vista-doctora`)
- Worktree C: `worktrees/panel-secretaria` (branch `feat/panel-secretaria`)

Cada agente trabaja sobre la rama base `main` ya con Phases 1, 2 y 3a aplicadas. Al terminar, el orquestador hace merge secuencial:
1. Resuelve conflictos triviales en `app.ts` y `bootstrap.ts` (append-only de bloques distintos).
2. Corre typecheck + lint global tras cada merge.
3. Si falla, devuelve la rama al worktree correspondiente para arreglo.

## Pipeline de verificación por spec

Cada `/run-spec` que termina debe pasar este pipeline antes de marcarse `done`:

1. **Typecheck**: `pnpm exec tsc --noEmit -p apps/web` y `pnpm exec tsc --noEmit -p apps/api` y `pnpm exec tsc --noEmit -p packages/db`.
2. **Lint**: `cd apps/web && pnpm lint`. (apps/api y packages no tienen ESLint configurado actualmente.)
3. **Verificador**: `/verify-spec <domain>/<feature>` — sub-agent que abre `spec.md` + `tasks.md` y comprueba que cada task tiene su deliverable real en el repo (archivo creado, símbolo definido, ruta registrada).

Si cualquier paso falla, el agente itera hasta que pase. Solo entonces actualiza `tasks.md` para marcar el spec.

## Orden de ejecución concreto

| Step | Acción | Paralelo | Tool |
|---|---|---|---|
| 0 | Preflight: setup turbo tasks, snapshot baseline lint/typecheck | no | orquestador |
| 1 | Run `correcciones-schema` | no | `/run-spec capa-datos/correcciones-schema` |
| 2 | Run 4 specs DB | sí (4 agents) | `/run-spec capa-datos/<x>` × 4 |
| 3a | Pre-scaffold zonas compartidas | no | orquestador |
| 3b | Run 3 worktrees por dominio | sí (3 agents) | `/run-spec <domain>/<feature>` secuencial intra-domain |
| 4 | Merge worktrees → main | no | orquestador |
| 5 | Verificación final global | no | typecheck + lint + verify-spec todos |

## Artefactos

- `.claude/commands/run-spec.md` — implementa una spec, corre verificación, actualiza `tasks.md`
- `.claude/commands/verify-spec.md` — verifica que la spec esté implementada
- `.claude/commands/run-phase.md` — orquestador que dispara una phase con sub-agents en paralelo
- `agent-os/execution-workflow.md` — este documento
