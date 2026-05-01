# Sincronización Automática con Google Calendar

## ¿Qué hace esta parte del sistema?

Esta capa de sincronización conecta AgendaMed con Google Calendar para que la doctora pueda ver su agenda directamente desde el calendario de su teléfono, sin necesidad de entrar a la aplicación. Cada vez que se configura un horario o un paciente reserva una cita, el sistema hace una llamada a la API de Google Calendar y refleja el evento allí. El resultado se guarda en los campos `googleEventId`, `googleHtmlLink` y `syncStatus` de la tabla `ScheduleEvents`.

La base de datos es siempre la fuente de verdad. Google Calendar actúa como una vista de solo lectura para conveniencia de la doctora: si la sincronización falla, la cita o el bloque de tiempo sigue existiendo con normalidad en AgendaMed, y el campo `syncStatus` queda en `'error'` para que el sistema lo reintente después. Esto significa que ningún fallo de Google bloquea el flujo normal del sistema.

La autenticación con Google usa una cuenta de servicio (service account) con credenciales OAuth2 almacenadas en variables de entorno. El ID del calendario personal de la doctora también se configura como variable de entorno, así el sistema sabe exactamente en qué calendario escribir sin depender de un flujo de autorización por parte de la usuaria.

## ¿Quién la usa?

El sistema la dispara automáticamente — la doctora se beneficia al ver su agenda actualizada en Google Calendar en su móvil, y el paciente no interactúa con esta capa en absoluto.

## ¿Cómo funciona?

Hay dos momentos en los que ocurre una sincronización. El primero es cuando la doctora guarda sus bloques de horario desde la pantalla de configurar-horarios: por cada `ScheduleEvent` insertado, el sistema llama a la API de Google Calendar para crear un evento con el rango de tiempo del slot. Si la llamada responde con éxito, se actualiza la fila con el `googleEventId` devuelto por Google, el `googleHtmlLink` para abrir el evento en el navegador, y `syncStatus` pasa a `'synced'`. Si la API no responde o devuelve un error, `syncStatus` queda en `'error'` y el slot sigue visible en AgendaMed con normalidad — simplemente no aparecerá en Google Calendar todavía.

El segundo momento ocurre cuando un paciente reserva una cita. Al insertar el registro en `MedicalAppointments`, el sistema busca el `googleEventId` del slot correspondiente en `ScheduleEvents`. Si existe, hace una llamada de actualización al evento de Google Calendar para añadir en la descripción el nombre del paciente y el motivo de consulta, de modo que la doctora pueda ver ese contexto desde su móvil. Si el `googleEventId` es nulo — porque la sincronización del slot nunca tuvo éxito — el sistema simplemente omite la llamada a Google; la reserva es válida y queda guardada en la base de datos sin que Google se entere.

Cuando un slot es cancelado o eliminado, el sistema usa el `googleEventId` almacenado para llamar a la API de Google y borrar o marcar como cancelado el evento correspondiente. Si el `googleEventId` es nulo porque la sincronización original falló, no hay nada que borrar en Google y el proceso termina ahí.

Para los casos en que la API de Google estuvo caída en el momento de la creación del slot, existe un proceso de reintento nocturno. Este sweep busca todas las filas de `ScheduleEvents` con `syncStatus = 'error'` e intenta de nuevo la llamada a Google Calendar. Los que tengan éxito pasan a `'synced'`; los que fallen de nuevo se quedan en `'error'` para el siguiente ciclo.

## Skills relevantes

- `/tech-elysia` — el servicio de sincronización se implementa como un plugin de Elysia que encapsula la llamada a la API de Google Calendar y se invoca desde los use cases de creación de slots y reserva de cita
- `/backend-architecture` — el use case de sincronización vive separado del use case de reserva y se llama después del commit a la base de datos, evitando que un fallo de Google revierta la transacción principal
- `/tech-drizzle` — el UPDATE sobre `ScheduleEvents` para persistir `googleEventId`, `googleHtmlLink` y `syncStatus` usa transacciones seguras y tipos inferidos del schema
