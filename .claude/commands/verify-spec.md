---
description: Verifica que una spec esté completamente implementada en el codebase. No modifica código.
argument-hint: <domain>/<feature>  (ej. portal-paciente/reservar-cita)
---

# /verify-spec

Auditas si la spec `$ARGUMENTS` está realmente implementada en el repo. **No edites nada.** Solo lees y reportas.

## Procedimiento

1. Abre `agent-os/specs/$ARGUMENTS/spec.md`, `tasks.md` y `references.md`.
2. Para **cada task** (cada `[ ]` o `[x]`) extrae:
   - El deliverable concreto (archivo, símbolo, ruta, endpoint, columna SQL, trigger, role).
   - Si el deliverable está en `references.md`, prioriza ese path.
3. Comprueba la existencia real:
   - Archivos: `Read` o `find`.
   - Símbolos / funciones / clases: usa jCodemunch (`search_symbols`, `get_file_outline`).
   - Endpoints Elysia: busca el handler en `apps/api/src/modules/*/presentation/*.routes.ts`.
   - Rutas Next.js: confirma `apps/web/src/app/<ruta>/page.tsx`.
   - Componentes UI: confirma que provienen de `@/components/ui/*` (shadcn) y no de imports externos.
   - SQL/SP/Roles: confirma archivo `.sql` y referencia en migrations.
4. Para tasks con verificación funcional (p.ej. "el endpoint devuelve 409 cuando…"), comprueba la **lógica**: lee el use case y verifica el branch correspondiente. No es necesario ejecutar; sí es necesario localizar el código que cumple esa condición.

## Reglas adicionales que verificas

- Cada componente visible al usuario: `import { ... } from '@/components/ui/...'` (shadcn).
- Textos UI en español.
- Sin `useEffect` para data fetching cuando se puede usar RSC + Eden Treaty server-side.
- En FSD, la capa `pages` está en `src/views/`, no en `src/pages/`.
- Errores se lanzan con `AppError(...)`, nunca `throw new Error(...)` desde use cases.

## Reporte (formato fijo)

```
SPEC: <domain>/<feature>
STATUS: PASS | FAIL

TASKS:
  [✓] <task 1 short title>  →  <archivo:línea o símbolo>
  [✗] <task 2 short title>  →  MISSING: <qué falta y dónde se esperaba>
  ...

RULES:
  [✓] shadcn/ui  → todos los componentes verificados desde @/components/ui
  [✗] textos español  →  archivo X tiene "Submit" sin traducir

OVERALL: PASS | FAIL
```

Si `OVERALL: FAIL`, listar los items concretos faltantes para que `/run-spec` itere.
