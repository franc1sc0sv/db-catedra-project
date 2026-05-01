# Agenda Diaria

## ¿Qué hace esta parte del sistema?

La agenda diaria es la primera pantalla que ve la secretaria al entrar al panel. Muestra todos los slots del día organizado en orden cronológico, con información suficiente para entender de un vistazo qué está pasando en la clínica: qué horarios están libres, cuáles tienen paciente, cuáles están bloqueados y cuáles ya fueron completados o cancelados.

Cada fila de la tabla corresponde a un slot del día y muestra la franja horaria, el estado del slot, el nombre completo del paciente si hay una cita asociada, el motivo de la reserva y el número de WhatsApp del paciente. Los colores distinguen visualmente los estados: disponible en tono neutro, ocupado en azul o similar, bloqueado en amarillo o naranja, completado en verde y cancelado en rojo tenue. Esto permite que la secretaria escanee la agenda sin leer cada celda.

La vista consume `DailyScheduleView`, que ya hace el JOIN entre `ScheduleEvents`, `MedicalAppointments` y `Patients`, así que la query de lectura es simple: filtrar por fecha y ordenar por hora de inicio.

## ¿Quién la usa?

La secretaria y el administrador de la clínica.

## ¿Cómo funciona?

Al abrir el panel, la vista carga automáticamente la agenda del día actual. La secretaria puede navegar a otras fechas usando controles de fecha —un selector de calendario o flechas de anterior/siguiente día— y la tabla se actualiza con los slots de esa fecha. Desde cualquier fila con una cita activa, la secretaria puede iniciar el flujo de cancelación o, si el slot está disponible, crear una nueva cita para un paciente registrado.

Si el día seleccionado no tiene ningún slot configurado —por ejemplo, porque la doctora no tiene agenda ese día de la semana— la vista muestra un mensaje claro indicando que no hay agenda configurada para esa fecha, en lugar de una tabla vacía que podría confundirse con un error. Si el día tiene slots pero ninguna cita reservada aún, la tabla se muestra normalmente con todos los slots en estado disponible. Esta distinción es importante porque un día sin slots y un día con slots libres son situaciones operativamente distintas.

## Skills relevantes

- `/tech-drizzle` — query sobre `DailyScheduleView` filtrada por fecha con orden cronológico
- `/frontend-design` — tabla de agenda con estados visuales diferenciados por color
- `/tailwind-css-patterns` — variantes de color por fila según `availabilityStatus`
- `/frontend-architecture` — ubicación de la página dentro de la capa `views` en FSD
