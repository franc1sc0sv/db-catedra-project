# Spec: Bloquear Horarios

## Descripción general

La secretaria (o el administrador) puede marcar franjas horarias como no disponibles para que no aparezcan como slots disponibles en el portal del paciente. Los tipos de bloqueo son: reunión (`meeting`), vacaciones (`vacation`) y bloqueo general (`block`). Los bloques también se pueden eliminar (desbloquear).

---

## Modelo: un evento por slot, no un evento por rango

Cuando la secretaria selecciona un rango de tiempo (p.ej. 09:00–11:00), el sistema **no crea un único `ScheduleEvent` que abarque todo el rango**. En cambio, crea **un `ScheduleEvent` independiente por cada slot estándar** que quede dentro del rango. Esto garantiza que:

- La lógica de disponibilidad (usada por el portal del paciente) sigue siendo una consulta simple: "dame todos los `ScheduleEvent` de tipo no-appointment para esta fecha".
- El desbloqueo granular es posible: la secretaria puede desbloquear un slot individual sin afectar el resto del rango.
- No hay ambigüedad al comparar slots de citas vs. slots bloqueados.

---

## Validación de conflictos (Use Case — backend)

Antes de ejecutar cualquier `INSERT`, el use case `CreateBlockUseCase` debe:

1. Calcular la lista de slots estándar cubiertos por el rango solicitado.
2. Para cada slot, consultar si existe un `Appointment` activo (`status != 'cancelled'`) que coincida con esa fecha y hora de inicio.
3. Si **alguno** de los slots tiene una cita activa:
   - Lanzar `AppError('El slot tiene una cita activa, cancélala primero', 409)` con información del paciente.
   - **No insertar ningún bloque** (la operación es todo-o-nada para el rango seleccionado).
4. Si todos los slots están libres: insertar un `ScheduleEvent` por cada slot con `type = blockType`.

La validación ocurre **dentro del use case**, nunca en la ruta ni en el cliente.

---

## Desbloqueo: guardia de seguridad

`DeleteBlockUseCase`:

1. Busca el `ScheduleEvent` por `id`. Si no existe → `AppError('Bloqueo no encontrado', 404)`.
2. Verifica que no exista un `Appointment` asociado al mismo slot (dato legado o corrupción). Si existe → `AppError('Este slot tiene una cita asociada', 409)`.
3. Si está limpio: ejecuta `DELETE`.

---

## Flujo UI (Client Component)

1. La secretaria abre `BloquearHorariosForm` desde `agenda-diaria` (botón "Bloquear franja").
2. Selecciona fecha, hora de inicio, hora de fin, y tipo de bloqueo.
3. Al confirmar, el cliente llama `POST /schedule-events/block` vía `clientApi`.
4. En caso de conflicto (409): muestra mensaje con nombre del paciente.
5. En caso de éxito (201): cierra el formulario y refresca la vista de agenda.

Para desbloquear: la secretaria selecciona un slot bloqueado en la agenda → botón "Desbloquear" → llama `DELETE /schedule-events/:id`.

---

## Invariantes críticas

- Un bloqueo **nunca** destruye ni modifica una cita existente.
- El formulario no permite enviar si la fecha es pasada (validación cliente, zod).
- El backend es la fuente de verdad para la validación de conflictos.
