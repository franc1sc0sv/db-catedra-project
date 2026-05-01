# Bloquear Horarios

## ¿Qué hace esta parte del sistema?

Esta funcionalidad le permite a la secretaria marcar franjas horarias como no disponibles en la agenda, ya sea por una reunión puntual de la doctora, un día de vacaciones o cualquier otro motivo operativo. Una vez bloqueado, el slot deja de aparecer como disponible para los pacientes en el portal de autogestión.

El bloqueo se traduce en un registro en `ScheduleEvents` con el `eventType` correspondiente al motivo (block, vacation, meeting) y con `availabilityStatus` en `blocked`. La secretaria también puede eliminar bloqueos existentes cuando la situación cambia, siempre que el slot bloqueado no tenga una cita asociada.

## ¿Quién la usa?

La secretaria y el administrador de la clínica.

## ¿Cómo funciona?

La secretaria abre el formulario de bloqueo, selecciona la fecha y un rango de tiempo, elige el tipo de bloqueo en un selector (reunión, vacaciones, bloqueo general) y guarda. Si el rango cubre múltiples franjas horarias estándar —como sucede con un día completo de vacaciones— el sistema crea un registro por cada franja, no uno solo para todo el rango. Esto mantiene la consistencia con la estructura de `ScheduleEvents`, donde cada slot es un registro independiente.

Antes de crear el bloqueo, el sistema valida que ninguno de los slots seleccionados tenga ya una cita activa. Si algún slot del rango está ocupado por un paciente, el sistema muestra una advertencia con el nombre del paciente y no permite continuar; la secretaria debe cancelar esa cita primero usando el flujo de cancelación correspondiente. Esta validación de solapamiento ocurre en el use case del backend antes de ejecutar el INSERT, evitando inconsistencias en la base de datos.

Para desbloquear, la secretaria selecciona el slot bloqueado desde la agenda diaria y elige la opción de eliminar el bloqueo. El sistema verifica que no haya una cita asociada al evento antes de borrarlo. Si el slot bloqueado tiene una cita —situación que no debería ocurrir bajo el flujo normal, pero que puede surgir por datos históricos— el sistema bloquea la eliminación y muestra un mensaje explicando el conflicto.

## Skills relevantes

- `/tech-drizzle` — INSERT en `ScheduleEvents` con validación de solapamiento por rango de fechas y horas
- `/tech-elysia` — ruta `POST /schedule-events` para crear bloqueos y `DELETE /schedule-events/:id` para eliminarlos
- `/backend-architecture` — use case de bloqueo con lógica de validación de conflictos antes del INSERT
- `/frontend-design` — selector de rango horario, tipo de bloqueo y confirmación visual del resultado
