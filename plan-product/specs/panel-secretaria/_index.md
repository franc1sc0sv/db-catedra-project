# Panel de Secretaria

El panel de la secretaria es el centro de control operativo de la clínica. Desde aquí se gestiona todo lo que el flujo automático del portal no puede manejar por sí solo: ver en tiempo real qué está pasando con la agenda del día, bloquear horarios cuando la doctora no estará disponible, atender cancelaciones de último momento y registrar pacientes que llegan por vías informales como WhatsApp sin haber creado una cuenta en el portal.

La secretaria actúa como filtro entre lo que el sistema procesa automáticamente y la realidad operativa de la clínica. Si un paciente llama para cancelar, si la doctora tiene una reunión imprevista, o si alguien pide cita por teléfono, todas esas situaciones pasan por este panel.

## What's inside this section

El panel agrupa cuatro funcionalidades principales que cubren el ciclo operativo diario de la secretaria.

- **agenda-diaria** — vista del día completo con todos los slots y su estado, navegable por fecha
- **bloquear-horarios** — creación y eliminación de bloqueos en la agenda por motivos como vacaciones o reuniones
- **cancelar-reagendar** — cancelación de citas con notificación automática al paciente y flujo de reagendamiento en dos pasos
- **registrar-paciente** — alta manual de pacientes sin cuenta web para que puedan recibir citas inmediatamente

## What data does this section work with?

El panel trabaja principalmente con `ScheduleEvents` y `MedicalAppointments` para gestionar la agenda, con `Patients` y `Users` para identificar a los pacientes, y con `WhatsAppMessages` para las notificaciones de cancelación. La vista `DailyScheduleView` centraliza la mayor parte de las consultas de lectura al cruzar estas entidades automáticamente.

## What does this section depend on?

Depende de la Capa de Datos (schema de base de datos y el stored procedure `sp_cancel_appointment`) y del Portal del Paciente, ya que los pacientes que usan el portal ya existen en la base de datos antes de llegar a este panel.

## Skills relevantes

- `/frontend-architecture` — estructura FSD para las páginas del panel bajo `apps/web`
- `/frontend-design` — UI de agenda diaria y formularios de gestión
- `/tailwind-css-patterns` — estilos de la tabla de agenda con variantes de color por estado
- `/tech-drizzle` — queries sobre `DailyScheduleView`, `ScheduleEvents` y `MedicalAppointments`
- `/tech-elysia` — rutas API para bloqueos, cancelaciones y registro de pacientes
- `/backend-architecture` — use cases para cancelación y creación de bloqueos con validación
- `/organization-best-practices` — RBAC para restringir acceso al rol secretaria/admin
