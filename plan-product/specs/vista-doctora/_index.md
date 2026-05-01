# Vista Doctora / Admin

La doctora es la figura central del sistema. Desde su vista, accede a todo lo que necesita para ejercer su jornada sin fricciones: sabe quién viene, conoce el historial de cada paciente antes de entrar al consultorio y puede cerrar la consulta dejando registro clínico de lo que ocurrió. No depende de nadie más para operar el sistema.

Como administradora del mismo sistema, también controla la configuración operativa: define cuándo está disponible, quién puede entrar al sistema y qué aseguradoras están habilitadas. Ambas dimensiones — la médica y la administrativa — conviven en la misma vista sin que una interfiera con la otra.

## What's inside this section

La sección agrupa cuatro funcionalidades ordenadas por frecuencia de uso: la agenda diaria es lo primero que ve la doctora cada día, el expediente es lo que consulta en cada atención, y la configuración de horarios y la gestión de usuarios son tareas administrativas periódicas.

- **agenda-hoy** — vista de la jornada del día con cada cita, su paciente y su estado.
- **expediente-consulta** — historial completo del paciente y formulario para registrar los hallazgos clínicos al cerrar la consulta.
- **configurar-horarios** — generación de bloques de disponibilidad en ScheduleEvents para días y rangos horarios específicos.
- **gestion-usuarios-seguros** — administración de cuentas de usuario y catálogo de aseguradoras.

## What data does this section work with?

Trabaja con ScheduleEvents y MedicalAppointments para la agenda, con Patients, MedicalRecords y ClinicalConsultations para el expediente clínico, y con Users y MedicalInsurances para las funciones administrativas. Las vistas DailyScheduleView y PatientFullRecordView son las principales fuentes de lectura.

## What does this section depend on?

Depende de la capa de datos: los stored procedures sp_complete_consultation y sp_get_patient_history, y la vista PatientFullRecordView deben estar definidos y accesibles antes de que cualquier funcionalidad de esta sección pueda operar correctamente.

## Skills relevantes

- `/frontend-architecture` — estructura FSD para las páginas de la doctora separando la vista médica de la administrativa.
- `/frontend-design` — agenda del día como timeline visual y expediente clínico como vista de dos paneles.
- `/tailwind-css-patterns` — estilos del formulario clínico, tabla de agenda y grids de configuración de horarios.
- `/tech-drizzle` — queries sobre DailyScheduleView, PatientFullRecordView, ClinicalConsultations y bulk inserts en ScheduleEvents.
- `/tech-elysia` — rutas API para el módulo clínico, gestión de horarios, usuarios y aseguradoras.
- `/backend-architecture` — use cases para completar consultas y generar agenda semanal.
- `/organization-best-practices` — acceso restringido por rol: doctor para la vista clínica, admin para la gestión de usuarios.
