# Reservar Cita

## ¿Qué hace esta parte del sistema?

Esta sección es el paso final del proceso de reserva: el paciente confirma el horario que eligió, indica el motivo de su consulta y el sistema registra la cita de forma segura. Al terminar, el paciente recibe una confirmación en pantalla y un mensaje de WhatsApp con los detalles de su cita.

Todo el proceso está diseñado para ser corto. El paciente no necesita volver a elegir su horario ni ingresar sus datos personales, porque ya están en el sistema. Solo revisa el resumen del slot seleccionado y escribe brevemente por qué va a la consulta.

## ¿Quién la usa?

La usa el paciente que ya tiene sesión activa y ha seleccionado un slot disponible desde el calendario.

## ¿Cómo funciona?

Cuando el paciente llega a esta pantalla, ya viene con un slot preseleccionado desde el calendario. El sistema muestra un resumen claro con la fecha, la hora de inicio y la hora de fin del evento. El paciente escribe el motivo de la consulta en un campo de texto (bookingReason) y hace clic en confirmar.

Al confirmar, el backend ejecuta tres pasos en secuencia. Primero crea un nuevo registro en la tabla MedicalAppointments vinculando el eventId del slot elegido con el patientDui del paciente autenticado. Luego, un trigger en la base de datos cambia automáticamente el campo availabilityStatus del ScheduleEvent correspondiente de 'available' a 'busy', para que ningún otro paciente pueda reservarlo. Finalmente, otro trigger inserta un registro en la tabla WhatsAppMessages de tipo 'confirmation' con los datos de la cita, que el sistema de mensajería procesa y envía al número de teléfono del paciente.

Hay dos situaciones de error que el sistema maneja de forma explícita. La primera es la condición de carrera: si entre el momento en que el paciente vio el slot disponible y el momento en que confirmó, otro paciente ya lo reservó, el sistema detecta el conflicto a través del unique constraint en el campo eventId de MedicalAppointments y muestra un mensaje claro que dice que ese cupo ya no está disponible e invita al paciente a elegir otro horario. La segunda es el perfil incompleto: si el paciente autenticado no tiene aún un registro en la tabla Patients con todos los campos obligatorios, el sistema no le permite confirmar y lo redirige a completar su ficha personal antes de continuar.

## Skills relevantes

- `/tech-drizzle` — INSERT en MedicalAppointments con manejo del unique constraint en eventId para detectar reservas simultáneas
- `/tech-elysia` — ruta POST /appointments que valida disponibilidad del slot, crea la cita y devuelve error descriptivo en caso de conflicto
- `/backend-architecture` — use case de reserva que encapsula los tres pasos (crear cita, validar unicidad, manejar conflicto) con manejo de errores limpio
- `/frontend-design` — pantalla de confirmación con resumen del slot, campo de motivo de consulta y estado de éxito/error post-reserva
