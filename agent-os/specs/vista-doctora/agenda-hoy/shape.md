# Agenda de Hoy — Shape

## Scope

MVP read-only. La doctora consulta su jornada; no puede crear ni cancelar citas desde esta pantalla.

Incluido:
- Query de `DailyScheduleView` filtrada por fecha y ordenada por `startTime`.
- Visualización de todos los slots (libres, reservados, completados, cancelados).
- Navegación por fecha via URL param `?fecha=YYYY-MM-DD`.
- Revalidación automática cada 30 segundos.
- Diagnóstico inline para consultas completadas.

Excluido (fuera de MVP):
- Crear/cancelar reservas desde esta pantalla.
- Notificaciones push en tiempo real (WebSocket).
- Historial clínico completo del paciente (botón "Ver historial" es placeholder).

---

## Decisiones de diseño

### RSC + revalidación (`revalidate = 30`) vs. polling del cliente

Se elige RSC con `export const revalidate = 30` en el segmento de ruta.

Razón: la pantalla es principalmente de lectura. El 99% del tiempo los datos no cambian durante la jornada. Un RSC evita hidratación de lógica de negocio en el cliente. La latencia de 30 s es aceptable para un MVP médico de bajo tráfico. Polling desde el cliente añadiría complejidad innecesaria (SWR, estado global, manejo de errores en el cliente).

Si en el futuro se requiere actualización en tiempo real (< 5 s), se puede agregar `useSWR` en el widget o un Server-Sent Events endpoint.

### Timeline visual vs. tabla

Se elige un **timeline vertical con tarjetas** en lugar de una tabla HTML.

Razón: la información médica tiene jerarquía visual (hora → paciente → diagnóstico). Una tabla plana dificulta distinguir slots libres de reservados de un vistazo. Las tarjetas permiten franja de color lateral como indicador de estado, lo que es más intuitivo en contexto clínico. Las tarjetas también escalan mejor en móvil.

### URL-param para fecha vs. estado del cliente

La fecha vive en la URL (`?fecha=YYYY-MM-DD`), no en `useState`.

Razón: la URL es compartible con el equipo administrativo, recargable sin pérdida de contexto, y compatible con el modelo mental de la doctora ("guardo esta URL para revisar la semana que viene"). Cumple la regla `frontend/thin-pages`.

### Módulo de agenda separado en la API

Se crea `apps/api/src/modules/agenda/` independiente en lugar de reutilizar el módulo `users` o `bookings`.

Razón: `DailyScheduleView` agrega datos de múltiples tablas. Un módulo propio mantiene la separación de responsabilidades y evita que el repositorio de reservas tenga lógica de vista agregada.

---

## Standards aplicados

| Standard | Decisión |
|----------|----------|
| `frontend/thin-pages` | `page.tsx` solo parsea `searchParams` y renderiza un view component |
| `frontend/fsd-layer-imports` | `views → widgets → shared` sin saltar capas |
| `backend/repository-pattern` | Abstract class token, `toEntity()`, `TxClient` disponible pero no requerido aquí |
| `/tech-drizzle` `rqb-select-columns` | Solo columnas necesarias en la query de la vista |
| `/next-best-practices` | `revalidate = 30`, async Server Component, params como `Promise` |
| `/frontend-design` | Timeline con color semántico por estado, tipografía jerárquica |
