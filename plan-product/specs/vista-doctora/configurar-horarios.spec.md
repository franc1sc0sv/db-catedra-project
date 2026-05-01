# Configurar Horarios

## ¿Qué hace esta parte del sistema?

La configuración de horarios es la forma en que la doctora define cuándo está disponible para atender. No es un calendario visual de solo lectura: es la herramienta con la que ella construye su agenda futura generando los bloques de tiempo que los pacientes luego pueden reservar.

Cada bloque de disponibilidad se convierte en un registro independiente en ScheduleEvents con eventType igual a appointment y availabilityStatus igual a available. Que cada slot sea su propio registro es intencional: garantiza que no puede haber duplicados y que cada bloque de tiempo es una entidad única que el sistema puede rastrear de forma independiente. La doctora puede ver en la misma pantalla cuáles slots ya fueron tomados por pacientes y cuáles siguen libres.

## ¿Quién la usa?

La doctora en su rol de administradora, típicamente al planificar la semana siguiente o cuando necesita ajustar su disponibilidad.

## ¿Cómo funciona?

La pantalla ofrece una grilla semanal donde la doctora selecciona días y rangos horarios. Puede marcar varios días a la vez — por ejemplo, lunes a viernes — y especificar que quiere cupos de 30 minutos entre las 8 a.m. y las 12 p.m. El sistema calcula los bloques resultantes y los muestra en una previsualización antes de confirmar. Al confirmar, hace un INSERT masivo en ScheduleEvents, uno por cada bloque calculado.

Si alguno de esos bloques ya existe en la base de datos porque la doctora los creó antes, el sistema detecta el solapamiento y rechaza solo los conflictivos, no toda la operación. La doctora recibe retroalimentación clara sobre cuántos slots se crearon y cuáles fueron ignorados por solapamiento.

Si la integración con Google Calendar está configurada, los slots creados pueden sincronizarse usando googleEventId, googleHtmlLink y syncStatus. Esta sincronización es transparente: la doctora no necesita hacer nada adicional si la integración está activa. Si no está configurada, los slots se crean igual y la sincronización simplemente no ocurre.

## Skills relevantes

- `/tech-drizzle` — INSERT masivo en ScheduleEvents con validación de solapamiento antes de escribir, usando transacción para garantizar atomicidad.
- `/tech-elysia` — ruta POST /schedule-events que recibe el rango y los días seleccionados, calcula los slots y ejecuta el bulk insert.
- `/backend-architecture` — use case GenerateWeeklySchedule que encapsula la lógica de cálculo de bloques y la detección de solapamientos.
- `/frontend-design` — grilla semanal interactiva con selector de días, rangos horarios y previsualización de los slots a crear antes de confirmar.
