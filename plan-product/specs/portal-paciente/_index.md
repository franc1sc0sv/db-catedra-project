# Portal del Paciente

El Portal del Paciente es el espacio donde los pacientes de la clínica pueden gestionar sus citas de forma completamente autónoma. En lugar de llamar por teléfono o enviar mensajes por WhatsApp para preguntar si hay cupo disponible, el paciente entra al portal, ve los horarios disponibles, reserva su espacio en minutos y recibe la confirmación directamente en su WhatsApp.

Además de la reserva, el portal centraliza toda la información que el paciente necesita: puede registrar sus datos personales y de seguro médico una sola vez, y después consultar el historial completo de sus visitas, incluyendo diagnósticos y tratamientos de consultas anteriores. Esto elimina el trabajo repetitivo de la secretaria y garantiza que los datos estén correctos desde el primer momento.

## What's inside this section

Esta sección cubre cuatro funcionalidades principales, desde que el paciente crea su cuenta hasta que consulta sus citas pasadas.

- **registro-perfil** — El paciente crea su cuenta con correo y contraseña, verifica su correo y completa su ficha personal con DUI, fecha de nacimiento, teléfono y aseguradora.
- **ver-disponibilidad** — Cualquier visitante (incluso sin cuenta) puede navegar el calendario y ver los horarios disponibles semana a semana.
- **reservar-cita** — El paciente autenticado selecciona un slot disponible, indica el motivo de consulta y confirma la reserva; el sistema la registra y envía confirmación por WhatsApp.
- **mis-citas** — El paciente ve todas sus citas próximas y pasadas, y puede revisar el diagnóstico y tratamiento de consultas ya realizadas.

## What data does this section work with?

Esta sección trabaja principalmente con las tablas Users, Patients, MedicalInsurances, ScheduleEvents, MedicalAppointments y WhatsAppMessages. Los datos de autenticación los gestiona Better Auth sobre la tabla Users y sus tablas auxiliares (Sessions, Accounts, Verifications).

## What does this section depend on?

Depende de que la capa de datos esté aplicada (schema de Drizzle con todos los fixes), y de Better Auth configurado para autenticación email/password con verificación de correo.

## Skills relevantes

- `/better-auth-best-practices` — configurar el servidor y cliente de autenticación con email/password y verificación de correo
- `/email-and-password-best-practices` — políticas de contraseña y flujo de verificación de correo electrónico
- `/frontend-architecture` — estructura FSD para las páginas y features del portal
- `/frontend-design` — UI del flujo de reserva, calendario de disponibilidad y formularios
- `/tailwind-css-patterns` — estilos de todos los componentes del portal
- `/next-best-practices` — patrones RSC para renderizar datos del servidor, especialmente el calendario
- `/tech-drizzle` — queries sobre ScheduleEvents, Patients, MedicalAppointments y relaciones
- `/tech-elysia` — rutas API para el módulo de reservas y gestión de pacientes
