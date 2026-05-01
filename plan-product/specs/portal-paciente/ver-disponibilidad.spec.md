# Ver Disponibilidad

## ¿Qué hace esta parte del sistema?

Esta sección muestra un calendario con todos los horarios disponibles para agendar una cita médica. Es la primera pantalla que ve el paciente cuando entra al portal y funciona como la puerta de entrada al proceso de reserva: al elegir un horario que le convenga, el sistema lo lleva directamente a confirmar la cita.

El calendario está diseñado para ser rápido y fácil de leer. Los horarios se muestran agrupados por fecha y el paciente puede navegar hacia adelante o hacia atrás semana a semana. Solo aparecen los slots que realmente están disponibles; los horarios ocupados, cancelados o bloqueados no se muestran para no generar confusión.

## ¿Quién la usa?

La puede usar cualquier visitante del portal, ya sea un paciente con cuenta o alguien que todavía no se ha registrado.

## ¿Cómo funciona?

Cuando el paciente llega a esta pantalla, el servidor consulta la tabla ScheduleEvents y filtra los registros donde el campo eventType sea 'appointment' y el campo availabilityStatus sea 'available'. Los resultados se agrupan por fecha y se presentan como una cuadrícula visual donde cada celda representa un horario con su hora de inicio y fin.

El paciente puede moverse entre semanas usando botones de navegación. Cada vez que cambia de semana, el sistema consulta nuevamente el rango de fechas correspondiente. Si no hay ningún slot disponible en la semana que está viendo, se muestra un mensaje claro que lo invita a navegar a otra semana.

Al hacer clic en un horario disponible, el sistema verifica si el paciente tiene sesión activa. Si ya inició sesión, lo lleva directamente al flujo de reserva con ese slot preseleccionado. Si aún no tiene cuenta o no inició sesión, se le muestra un aviso amigable que lo invita a iniciar sesión o registrarse, y una vez que lo hace, el sistema lo redirige automáticamente al flujo de reserva con el slot que había elegido, sin que tenga que buscarlo de nuevo.

## Skills relevantes

- `/next-best-practices` — renderizar el calendario como React Server Component para que los datos lleguen del servidor sin necesidad de carga adicional en el cliente
- `/tech-drizzle` — query sobre ScheduleEvents filtrando por eventType, availabilityStatus y rango de fechas de la semana seleccionada
- `/frontend-design` — calendario visual por semana con cuadrícula de slots y navegación fluida entre semanas
- `/tailwind-css-patterns` — grid de horarios con colores diferenciados para slots disponibles y estados de hover/selección
