# Recordatorio Automático de Cita por WhatsApp (RECORDATORIO_24H)

## ¿Qué hace esta parte del sistema?

Esta parte del sistema se encarga de enviar automáticamente un mensaje de WhatsApp a cada paciente el día anterior a su cita médica. El objetivo es reducir las inasistencias dando al paciente un aviso oportuno con la fecha y hora exacta de su consulta. El mensaje se registra en la tabla `WhatsAppMessages` con `messageType = 'reminder'` para mantener trazabilidad completa de todas las comunicaciones salientes del sistema.

A diferencia de los mensajes de confirmación y cancelación, que se generan como respuesta inmediata a una acción del usuario, el recordatorio no tiene un disparador humano. Es el resultado de un proceso que corre una vez al día, revisa qué citas están programadas para el día siguiente y produce un mensaje por cada una. Este comportamiento lo hace estructuralmente diferente a los triggers de PostgreSQL existentes: no puede modelarse como una reacción a un evento de base de datos porque el evento relevante ocurrió en el pasado (el agendamiento de la cita) y la acción debe ocurrir en un momento futuro determinado por el reloj.

El registro del intento de envío persiste independientemente de si la llamada a la API de WhatsApp tuvo éxito. Esto garantiza que el historial de comunicaciones del sistema sea confiable para auditorías y para diagnosticar fallos de entrega sin necesidad de revisar logs externos.

## ¿Quién la usa?

El proceso corre automáticamente vía scheduler sin intervención humana; los pacientes y el médico se benefician pasivamente al reducirse la tasa de ausentismo.

## ¿Cómo funciona?

Una vez al día, el job consulta las tablas `MedicalAppointments`, `ScheduleEvents` y `Patients` para obtener todas las citas cuyo `eventDate` sea igual a `CURRENT_DATE + 1` y cuyo `availabilityStatus` sea `'busy'`. Para cada cita encontrada, verifica en `WhatsAppMessages` si ya existe un registro con `appointmentId` igual al de esa cita y `messageType = 'reminder'`; si ya existe, la omite sin error. Si no existe, construye un `messageBody` con el nombre del paciente, la fecha y la hora de inicio de la cita, y llama a la API de WhatsApp usando el `whatsappPhone` del registro correspondiente en `Patients`. A continuación inserta una fila en `WhatsAppMessages` con `deliveryStatus = 'sent'` si la llamada fue exitosa, o `deliveryStatus = 'failed'` si la API devolvió error. En ambos casos el job continúa procesando las citas restantes; un fallo individual no aborta el lote completo.

Hay dos situaciones límite importantes. La primera: si entre el momento en que se agendó la cita y el momento en que corre el job la cita fue cancelada, el `availabilityStatus` del evento habrá cambiado a `'cancelled'` mediante `sp_cancel_appointment`. La query inicial filtra por `availabilityStatus = 'busy'`, por lo que esas citas canceladas nunca entran al procesamiento y no se envía recordatorio. La segunda: si por algún motivo el job corre dos veces en el mismo día —reinicio del servidor, doble ejecución por error de configuración del cron— la verificación de duplicado evita insertar un segundo recordatorio para la misma cita, haciendo la operación idempotente.

En la implementación con Bun/Elysia, el job puede vivir como un plugin de Elysia que registra un cron interno al arrancar el servidor, o como un script independiente invocado por cron del sistema operativo. A la escala de una clínica pequeña no se necesita una cola de mensajes ni un worker dedicado; la lógica secuencial dentro del job es suficiente.

## Skills relevantes

- `/tech-elysia` — para implementar el cron job dentro del servidor Elysia como plugin o como script Bun independiente invocado por OS cron
- `/tech-drizzle` — para la query con join entre `MedicalAppointments`, `ScheduleEvents` y `Patients`, el subquery de deduplicación contra `WhatsAppMessages`, y la inserción del registro de auditoría
- `/backend-architecture` — use case de envío de recordatorio con lógica de deduplicación y manejo de fallo por cita sin abortar el lote
