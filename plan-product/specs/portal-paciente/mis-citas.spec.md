# Mis Citas

## ¿Qué hace esta parte del sistema?

Esta sección es el historial personal del paciente dentro del portal. Aquí puede ver de un vistazo todas sus citas, tanto las que tiene programadas para el futuro como las que ya pasaron. Para las citas pasadas donde hubo una consulta, puede ver el diagnóstico y el tratamiento que el doctor registró, lo que le permite llevar un seguimiento de su salud sin depender de papeles ni de llamar a la clínica.

El paciente tiene acceso de lectura a toda esta información, pero no puede modificar ni cancelar nada por su cuenta. Los cambios en las citas los gestiona únicamente la secretaria desde el panel administrativo.

## ¿Quién la usa?

La usa el paciente autenticado que quiere ver el estado de sus citas o revisar información de visitas anteriores.

## ¿Cómo funciona?

Al entrar a esta sección, el sistema consulta todas las MedicalAppointments vinculadas al patientDui del paciente autenticado. Los registros se dividen en dos grupos: las citas próximas son las que tienen un ScheduleEvent con fecha futura, y las citas pasadas son las que tienen fecha ya transcurrida.

Para cada cita próxima, el paciente ve la fecha, la hora, el motivo que escribió al reservar y el estado actual de la cita. Para cada cita pasada, además de esos datos, el sistema verifica si existe una ClinicalConsultation asociada a esa cita. Si existe, muestra el diagnóstico y el tratamiento registrado por el doctor. Si la consulta pasada no tiene un registro clínico todavía (por ejemplo, si la secretaria aún no lo cargó), simplemente no se muestra esa sección, sin generar error.

Si el paciente no tiene ninguna cita registrada, ya sea porque es nuevo o porque aún no ha reservado, la pantalla muestra un estado vacío amigable con un mensaje claro y un botón directo para ir al calendario de disponibilidad y hacer su primera reserva.

Los datos se cargan como Server Component con paginación para no traer todo el historial de golpe si el paciente tiene muchas citas antiguas. Las citas próximas siempre aparecen primero y ordenadas de la más cercana a la más lejana; las pasadas aparecen de la más reciente a la más antigua.

## Skills relevantes

- `/tech-drizzle` — query relacional que parte de MedicalAppointments, incluye ScheduleEvents para fechas y horas, y hace un join opcional con ClinicalConsultations filtrado por patientDui
- `/next-best-practices` — Server Component con carga paginada de datos para no bloquear la pantalla mientras llegan los registros históricos
- `/frontend-design` — lista de citas con secciones diferenciadas para próximas y pasadas, estados visuales claros y estado vacío amigable
