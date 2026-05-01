# Procedimientos Almacenados

## ¿Qué hace esta parte del sistema?

El sistema requiere cuatro stored procedures que encapsulan operaciones de negocio que involucran múltiples pasos dependientes. Centralizar esta lógica en la base de datos garantiza atomicidad sin importar desde qué capa de la aplicación se invoque el procedimiento, y simplifica los use cases de la API que solo necesitan hacer un `CALL sp_...` en lugar de orquestar varias queries individuales.

Cada stored procedure cubre una funcionalidad distinta: consulta de disponibilidad, cancelación de cita, cierre de consulta clínica, e historial del paciente. Esta variedad también cumple el criterio del rubric que requiere funcionalidades distintas entre sí.

## ¿Quién la usa?

El desarrollador que implementa los use cases de la API en `apps/api`; los stored procedures son llamados desde los repositorios Drizzle usando `db.execute(sql\`CALL sp_...\`)`.

## ¿Cómo funciona?

`sp_get_available_slots(p_date DATE)` es una función de solo lectura que retorna todos los `ScheduleEvents` de tipo `appointment` con `availabilityStatus = 'available'` para la fecha indicada. Devuelve las columnas `id`, `eventDate`, `startTime` y `endTime`. Este procedimiento alimenta el calendario del portal del paciente: cada vez que alguien abre la pantalla de reserva, el frontend llama a este slot para obtener los bloques de tiempo disponibles. No tiene efectos secundarios y puede ejecutarse en lectura sin transacción.

`sp_cancel_appointment(p_appointment_id UUID, p_cancelled_by UUID)` realiza tres operaciones en una sola transacción: primero verifica que la cita no esté ya en estado `completed` — si lo está, lanza una excepción con `RAISE EXCEPTION` para que el caller reciba un error claro y no una cancelación silenciosa de una consulta ya atendida; luego cambia el `availabilityStatus` del `ScheduleEvent` asociado a `cancelled` y registra en `auditUserId` el id del usuario que ejecutó la cancelación; finalmente inserta un `WhatsAppMessage` de tipo `cancellation` dirigido al teléfono del paciente. Si cualquiera de los tres pasos falla, el `ROLLBACK` automático de la transacción revierte todo. El stored procedure necesita resolver el `patientDui` a partir del `appointmentId` para obtener el `whatsappPhone` de `Patients`, lo que implica dos JOINs internos.

`sp_complete_consultation(p_appointment_id UUID, p_symptoms TEXT, p_bp VARCHAR, p_weight NUMERIC, p_diagnosis TEXT, p_treatment TEXT, p_notes TEXT)` cierra una consulta en una sola transacción: primero navega la cadena `MedicalAppointments → Patients → MedicalRecords` para obtener el `recordId` correcto; luego inserta el registro en `ClinicalConsultations` con todos los datos clínicos pasados como parámetros; finalmente actualiza el `ScheduleEvent` asociado a `completed`. La atomicidad es crítica aquí: si el INSERT en `ClinicalConsultations` tiene éxito pero el UPDATE del evento falla, el sistema quedaría en un estado inconsistente donde hay datos clínicos registrados pero el slot sigue marcado como `busy`. La transacción garantiza que los tres pasos ocurran juntos o ninguno.

`sp_get_patient_history(p_dui VARCHAR)` es otra función de solo lectura que retorna el historial completo de un paciente. Combina los datos de `PatientFullRecordView` para la información general y la última consulta, con todas las entradas de `ClinicalConsultations` para ese paciente ordenadas por fecha descendente. La doctora invoca este procedimiento antes de iniciar una consulta para revisar el historial del paciente. No tiene efectos secundarios. El resultado incluye columnas de ambas fuentes; en Drizzle el resultado se tipea como un array del tipo inferido manualmente ya que no es una tabla del schema.

## Skills relevantes

- `/backend-architecture` — los stored procedures son llamados desde los use cases del módulo correspondiente en `apps/api`; el use case recibe el resultado tipado y lo convierte al DTO de respuesta
- `/tech-drizzle` — se ejecutan con `db.execute(sql\`CALL sp_nombre($1, $2)\`, [param1, param2])` desde el repositorio Drizzle; para los que retornan filas, se usa `db.execute(sql\`SELECT * FROM sp_nombre($1)\`)` si se definen como funciones `RETURNS TABLE`
