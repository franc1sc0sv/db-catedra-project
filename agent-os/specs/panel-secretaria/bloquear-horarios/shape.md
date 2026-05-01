# Shape: Bloquear Horarios

## Scope

| Dimensión | Detalle |
|-----------|---------|
| Dominio | panel-secretaria |
| Actores | Secretaria, Administrador |
| Entidad principal | `ScheduleEvent` (type: meeting / vacation / block) |
| Operaciones | CREATE block (POST), DELETE block (DELETE) |
| Impacto | Slots bloqueados desaparecen del portal del paciente |

---

## Decisiones de diseño

### 1. Un evento por slot, no un evento por rango

**Decisión:** Al bloquear un rango (p.ej. 09:00–11:00), se crean N `ScheduleEvent` individuales (uno por slot de 30 min), no un único evento que cubra todo el rango.

**Razón:** La tabla `ScheduleEvent` ya modela slots individuales (usada por `ver-disponibilidad`). Un evento de rango requeriría lógica de expansión en cada consulta de disponibilidad. Los eventos individuales son más simples de consultar, invalidar y desbloquear de forma granular.

**Trade-off aceptado:** Si el doctor tiene slots de duración variable, el use case debe conocer la duración del slot. Se asume duración fija configurable (30 min por defecto en MVP).

### 2. Validación de conflictos en el use case (no en la ruta)

**Decisión:** `CreateBlockUseCase.handle()` verifica la ausencia de citas activas antes de insertar. La ruta no hace ninguna validación.

**Razón:** Alinea con el estándar `backend/use-case-pattern`. Las rutas son thin controllers. La lógica de negocio crítica (no destruir citas) vive en la capa de aplicación.

### 3. Operación todo-o-nada para el rango

**Decisión:** Si cualquier slot del rango tiene una cita activa, no se crea ningún bloque (ni siquiera para los slots libres del mismo rango).

**Razón:** Experiencia de usuario consistente. Si el sistema creara bloques parciales, la secretaria quedaría en un estado confuso sin saber qué slots se bloquearon. El error 409 incluye el nombre del paciente conflictivo para que pueda actuar.

### 4. Guardia de seguridad en DeleteBlockUseCase

**Decisión:** Antes de eliminar, verificar que no exista `Appointment` en el slot (aunque en flujo normal no debería existir).

**Razón:** Protección contra datos legados o condiciones de carrera donde una cita se creó en un slot bloqueado por un bug previo.

### 5. UI como Client Component con Dialog

**Decisión:** `BloquearHorariosForm` es un Client Component (`'use client'`) abierto desde agenda-diaria mediante un Dialog/Sheet de shadcn.

**Razón:** Requiere estado de formulario, validación interactiva y manejo de respuesta async. Se dispara desde la vista existente sin necesidad de ruta propia.

---

## Standards aplicados

| Standard | Aplicación |
|----------|-----------|
| `backend/use-case-pattern` | `CreateBlockUseCase`, `DeleteBlockUseCase` con `@injectable`, `BaseUseCase`, `AppError` |
| `backend/repository-pattern` | Acceso a DB via repositorio con `TxClient` |
| `backend/error-handling` | Solo `AppError`, nunca try/catch en rutas |
| `frontend/entity-schemas` | Zod schemas en `entities/schedule-event/model/schemas.ts` |
| `frontend/fsd-public-api` | `features/block-schedule/index.ts` como único punto de importación |

---

## Fuera de scope (MVP)

- Bloqueos recurrentes (p.ej. "todos los lunes")
- Notificación al paciente cuando su slot es bloqueado
- Vista de historial de bloqueos
- Bloqueos por doctor distinto al autenticado
