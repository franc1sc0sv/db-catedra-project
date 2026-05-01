# Agenda de Hoy

## ¿Qué hace esta parte del sistema?

La agenda de hoy es la pantalla principal de la doctora. En cuanto inicia sesión, ve su jornada del día actual: cada bloque de tiempo está ahí, ordenado por hora, con el nombre del paciente, el motivo de la reserva y el estado de ese slot. No hay que buscar nada ni navegar a otro lado para saber qué viene.

La información viene de DailyScheduleView, una vista que ya consolida ScheduleEvents con MedicalAppointments. Cada fila puede ser una cita confirmada con paciente, un slot libre sin reserva, o un bloque personal como almuerzo o vacaciones. Los bloques bloqueados aparecen visualmente distintos — en gris — para que la doctora pueda leerlos de un vistazo sin confundirlos con citas reales. Las citas ya atendidas muestran el diagnóstico principal de la consulta clínica asociada, para que quede constancia de lo que pasó sin tener que abrir el expediente.

La doctora también puede navegar hacia días futuros para revisar con anticipación quién viene. Esta vista no es interactiva en el sentido de que no permite crear ni cancelar citas directamente — su propósito es informar y servir como punto de entrada al expediente de cada paciente.

## ¿Quién la usa?

La doctora, exclusivamente, al inicio de cada jornada y cuando quiere prepararse para días próximos.

## ¿Cómo funciona?

Al cargar la página, el sistema consulta DailyScheduleView filtrado por la fecha actual y muestra los resultados ordenados por startTime. Cada entrada en la lista tiene hora de inicio y fin, nombre completo del paciente si hay reserva, motivo de la cita y un botón para abrir el expediente completo. Si el slot no tiene paciente vinculado porque nadie lo ha reservado, se muestra como cupo abierto sin nombre — la doctora sabe que tiene tiempo libre sin que el sistema lo omita.

Cuando un día no tiene ninguna cita confirmada, la agenda no aparece vacía: muestra los slots disponibles del día igual, para que la doctora tenga visibilidad de su tiempo aunque no haya pacientes agendados. Las citas completadas muestran el diagnóstico de la consulta clínica directamente en la fila, sin necesidad de entrar al expediente.

La navegación entre días usa parámetros de fecha en la URL, lo que permite compartir o refrescar la vista sin perder el contexto. La revalidación es periódica para que si una cita se confirma mientras la doctora tiene la pantalla abierta, el cambio aparezca pronto sin requerir un refresh manual.

## Skills relevantes

- `/tech-drizzle` — query sobre DailyScheduleView filtrado por fecha, seleccionando solo las columnas necesarias para la vista.
- `/next-best-practices` — Server Component con revalidación periódica usando revalidate o fetch con intervalo.
- `/frontend-design` — timeline visual de la jornada médica donde cada bloque refleja el estado de la cita con color y tipografía diferenciada.
- `/frontend-architecture` — la página vive en la capa views dentro del slice de la doctora, con componentes de presentación en widgets.
