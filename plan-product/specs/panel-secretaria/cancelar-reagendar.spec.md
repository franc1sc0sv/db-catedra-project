# Cancelar y Reagendar

## ¿Qué hace esta parte del sistema?

Esta funcionalidad le permite a la secretaria cancelar una cita existente directamente desde la agenda diaria. Cuando se cancela, el sistema ejecuta el stored procedure `sp_cancel_appointment`, que actualiza el `availabilityStatus` del `ScheduleEvent` a `cancelled`, registra en `auditUserId` quién realizó la acción, y genera automáticamente un `WhatsAppMessage` de tipo `cancellation` para notificar al paciente sin que la secretaria tenga que hacerlo manualmente.

Reagendar no es una operación atómica de "mover cita". En cambio, se hace en dos pasos: primero cancelar la cita actual y luego crear una nueva cita en otro slot disponible. Esta decisión de diseño preserva la integridad de la relación 1:1 entre cada `MedicalAppointment` y su `ScheduleEvent`, evitando que existan citas que apunten a eventos que ya tenían otro estado.

## ¿Quién la usa?

La secretaria y el administrador de la clínica.

## ¿Cómo funciona?

La secretaria selecciona una fila con cita en la agenda diaria y elige la opción de cancelar. El sistema abre un modal de confirmación que muestra el nombre del paciente y la hora de la cita para evitar cancelaciones accidentales. Al confirmar, el backend ejecuta `sp_cancel_appointment` y la fila cambia de estado en la vista.

Si la cita que se intenta cancelar ya tiene `availabilityStatus` en `completed`, el sistema bloquea la acción y muestra un mensaje explicando que las consultas completadas no pueden cancelarse. Si la cancelación ocurre el mismo día con menos de una hora de anticipación respecto a la hora de la cita, el sistema registra la acción igualmente —no la bloquea— pero muestra una advertencia informativa para que la secretaria sea consciente de la situación; en esos casos la notificación de WhatsApp se envía de todas formas.

Para reagendar, una vez confirmada la cancelación el sistema puede ofrecer ir directamente a la vista de agenda para elegir otro slot disponible, donde la secretaria puede crear una nueva cita para el mismo paciente. El flujo es deliberadamente explícito y en dos pasos para que quede claro en el historial que hubo una cancelación y una nueva reserva, no una edición silenciosa.

## Skills relevantes

- `/backend-architecture` — integración con `sp_cancel_appointment` y manejo de `auditUserId` en el use case
- `/tech-drizzle` — UPDATE sobre `ScheduleEvents` e INSERT en `WhatsAppMessages` dentro de una transacción
- `/tech-elysia` — ruta `PATCH /appointments/:id/cancel` con validaciones de estado previo
- `/frontend-design` — modal de confirmación con nombre del paciente, hora y advertencias contextuales
