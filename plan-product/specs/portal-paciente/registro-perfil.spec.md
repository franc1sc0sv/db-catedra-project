# Registro y Perfil del Paciente

## ¿Qué hace esta parte del sistema?

Esta sección permite que un paciente nuevo cree su cuenta en el portal y complete su ficha personal. El proceso está dividido en dos pasos claros: primero se registra con correo y contraseña, verifica su correo electrónico, y luego completa los datos personales que la clínica necesita para atenderlo.

Al terminar, el sistema tiene todo lo necesario para identificar al paciente, contactarlo por WhatsApp y vincularlo con su aseguradora médica. También se crea automáticamente su expediente médico vacío en la base de datos, listo para que la secretaria o el doctor añadan información después de la primera consulta.

Esta pantalla es el punto de entrada para cualquier paciente que quiera usar el portal por primera vez. Una vez que tiene cuenta y ficha completa, puede ver disponibilidad, reservar citas y consultar su historial sin volver a pasar por aquí.

## ¿Quién la usa?

La usa el paciente que llega por primera vez al portal y no tiene cuenta registrada en el sistema.

## ¿Cómo funciona?

El paciente accede al portal y elige registrarse. Ingresa su correo electrónico y una contraseña que cumpla con la política mínima de seguridad (largo mínimo, combinación de caracteres). Better Auth se encarga de crear el usuario y enviar un correo de verificación. El paciente debe hacer clic en el enlace de ese correo antes de poder continuar; si intenta saltarse este paso, el sistema lo regresa a una pantalla de aviso.

Una vez verificado el correo, el sistema lleva al paciente a completar su ficha personal. Aquí ingresa sus nombres y apellidos, su número de DUI (exactamente 9 caracteres, sin guiones), su fecha de nacimiento, su número de teléfono de WhatsApp y selecciona su aseguradora médica de un listado que viene de la tabla MedicalInsurances. Al guardar, el sistema crea el registro en la tabla Patients con el DUI como llave primaria y lo vincula al usuario recién creado. Un trigger en la base de datos crea automáticamente el MedicalRecord vacío asociado a ese paciente.

Hay dos casos especiales importantes. Si el paciente ingresa un DUI que ya existe en la tabla Patients y ese registro tiene el campo userId vacío (es decir, la secretaria ya lo había cargado manualmente antes de que él se registrara), el sistema vincula ese registro existente al nuevo usuario en lugar de crear uno duplicado. Si en cambio el DUI ya pertenece a otro usuario registrado, se muestra un error claro indicando que ese DUI ya está asociado a otra cuenta. Por otro lado, si el paciente intenta registrarse con un correo que ya existe en el sistema, no se crea una cuenta nueva sino que se le redirige a la pantalla de inicio de sesión con un mensaje que indica que ya tiene una cuenta.

## Skills relevantes

- `/better-auth-best-practices` — configurar el registro con email/password y el flujo de verificación de correo antes de permitir acceso
- `/email-and-password-best-practices` — definir la política de contraseña y el comportamiento del enlace de verificación (expiración, reenvío)
- `/frontend-design` — diseñar el formulario de registro en dos pasos: paso 1 de cuenta y paso 2 de ficha personal
- `/tailwind-css-patterns` — estilos del formulario multi-paso, indicadores de progreso y mensajes de error inline
- `/tech-drizzle` — INSERT en la tabla Patients con FK a Users.id y MedicalInsurances.id, manejo del unique constraint en DUI y en userId
