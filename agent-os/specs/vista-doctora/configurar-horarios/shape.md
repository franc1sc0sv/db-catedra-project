# Shape: Configurar Horarios

## Alcance

**Incluido:**
- Generación de slots para la semana en curso (día siguiente → 7 días).
- Overlap detection por `doctorId` + intervalo de tiempo.
- Bulk INSERT con transacción Drizzle.
- Preview en cliente antes de confirmar.
- Feedback de slots creados vs. ignorados.
- Nota de integración Google Calendar (si credentials configuradas).

**Excluido del MVP:**
- Generación multi-semana o para fechas arbitrarias.
- Edición de slots individuales en el preview.
- UI de gestión de integración Google Calendar.
- Notificación a pacientes al crear disponibilidad.

---

## Decisiones de Diseño

### Preview: cliente vs. servidor

**Decisión:** Preview calculado en servidor (`POST /schedule-events/preview`), no en cliente.

**Razón:** La lógica de overlap detection requiere acceso a la base de datos. Calcular en servidor evita duplicar esa lógica en el cliente y garantiza que el preview refleja exactamente lo que se insertará.

**Alternativa descartada:** Cálculo de slots en cliente con Zod/fechas puras para una respuesta más rápida. Descartada porque el overlap check haría que el preview fuera inexacto.

---

### Detección de solapamiento: por slot vs. por rango

**Decisión:** Overlap detection slot a slot con condición SQL de intersección de intervalos.

**Razón:** Granularidad correcta — omite solo los conflictos puntuales, no bloques enteros del rango. El usuario recibe feedback preciso ("Y ignorados").

**Alternativa descartada:** Rechazar toda la operación si hay cualquier solapamiento. Descartada — demasiado restrictivo para un flujo de generación de horarios recurrentes.

---

### Transacción Drizzle

**Decisión:** Todo el bulk INSERT ocurre dentro de `db.transaction()`.

**Razón:** Si falla la inserción a mitad del lote, no quedan slots parciales sin su par. Estándar `migration-transaction-safety` de `/tech-drizzle`.

---

### Estructura del módulo API

**Decisión:** Extender el módulo `schedule-events` existente (creado para ver-disponibilidad) si ya existe; crear módulo nuevo solo si no existe.

**Razón:** Evitar duplicar bindings Inversify y el overhead de registrar un segundo módulo para el mismo aggregate.

---

### Estado de carga en frontend

**Decisión:** `useTransition` para el submit de preview y confirmación.

**Razón:** Mantiene la UI responsiva durante la petición. Sigue el estándar `rendering-usetransition-loading` de `/vercel-react-best-practices`.

---

## Estándares Aplicados

| Estándar | Fuente |
|----------|--------|
| `frontend/entity-schemas` | Proyecto |
| `frontend/fsd-public-api` | `/frontend-architecture` |
| `frontend/thin-pages` | `/frontend-architecture` |
| `backend/use-case-pattern` | `/backend-architecture` |
| `backend/repository-pattern` | `/backend-architecture` |
| `backend/error-handling` | `/backend-architecture` |
| `backend/module-registration` | `/backend-architecture` |
| `migration-transaction-safety` | `/tech-drizzle` |
| `rqb-prefer-relational` | `/tech-drizzle` |
| `rendering-usetransition-loading` | `/vercel-react-best-practices` |
