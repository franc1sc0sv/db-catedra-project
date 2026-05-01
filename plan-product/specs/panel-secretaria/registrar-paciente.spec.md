# Registrar Paciente

## ¿Qué hace esta parte del sistema?

Esta funcionalidad cubre el caso donde un paciente contacta a la clínica por teléfono o WhatsApp sin haber creado una cuenta en el portal. La secretaria puede ingresarlo manualmente en el sistema para que quede registrado como paciente y pueda recibir citas, aunque nunca haya pasado por el flujo de registro web.

El campo `userId` en la tabla `Patients` es nullable por diseño precisamente para este escenario: un paciente puede existir en la base de datos sin tener una cuenta de usuario asociada. Cuando la secretaria completa el alta manual, un trigger de la base de datos crea automáticamente el `MedicalRecord` del paciente con `bloodType` en `NULL`, que la doctora actualizará en la primera consulta.

## ¿Quién la usa?

La secretaria y el administrador de la clínica.

## ¿Cómo funciona?

La secretaria abre el formulario de registro rápido e ingresa los datos básicos del paciente: nombres, apellidos, DUI, fecha de nacimiento y número de WhatsApp. Opcionalmente puede asignar una aseguradora médica si el paciente la tiene. El formulario es compacto y directo, pensado para completarse mientras el paciente está al teléfono.

Antes de guardar, el sistema verifica que el DUI no exista ya en la base de datos. Si ya hay un paciente registrado con ese DUI, en lugar de crear un duplicado el sistema muestra el registro existente para que la secretaria lo revise y, si es el mismo paciente, proceda directamente a crearle una cita. Este control es importante porque los pacientes de WhatsApp a veces ya existen si fueron registrados manualmente en una visita anterior.

Una vez guardado el paciente, la secretaria puede ir directamente desde el formulario a la agenda para reservarle una cita, sin necesidad de buscarlo por separado. Si en el futuro ese paciente decide crear su propia cuenta en el portal, el sistema permite vincular el registro existente al nuevo `Users.id`, de modo que todo el historial clínico queda conectado a la cuenta web sin perder datos previos.

## Skills relevantes

- `/tech-drizzle` — INSERT en `Patients` con `userId` nullable y verificación previa de DUI duplicado
- `/tech-elysia` — ruta `POST /patients` con validación de unicidad de DUI y respuesta con el paciente creado
- `/frontend-design` — formulario compacto de registro con feedback inmediato en caso de duplicado
- `/organization-best-practices` — acceso restringido al rol secretaria/admin mediante RBAC
