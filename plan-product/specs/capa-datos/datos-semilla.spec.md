# Datos Semilla

## ¿Qué hace esta parte del sistema?

El script de seed puebla la base de datos con datos de prueba realistas que permiten verificar el comportamiento del sistema end-to-end sin necesidad de crear datos manualmente. El rubric requiere al menos 25 registros por tabla y que el script demuestre las cuatro operaciones DML: INSERT, SELECT, UPDATE y DELETE. El seed también es la forma más rápida de que el evaluador pueda verificar que los triggers, stored procedures, vistas y roles funcionan correctamente sobre datos reales.

Los datos de prueba usan nombres, DUIs y números de teléfono salvadoreños ficticios pero plausibles, diagnósticos médicos genéricos pero coherentes, y un rango de fechas que incluye citas pasadas (con consultas completadas), citas futuras (disponibles) y algunos slots bloqueados por vacaciones o reuniones.

## ¿Quién la usa?

El desarrollador que ejecuta `bun run db:seed` para inicializar el entorno local o de evaluación, y el evaluador académico que verifica los datos resultantes.

## ¿Cómo funciona?

El script de seed se ejecuta en orden estricto respetando las claves foráneas. Primero inserta las `MedicalInsurances` — 25 aseguradoras ficticias con distintos `coverageType` distribuidos entre los cinco valores del enum — porque `Patients` las referencia. Luego inserta los `Users` — 25 usuarios con roles mixtos: mayoría pacientes, tres o cuatro doctoras, dos secretarias, un admin — usando contraseñas hasheadas para los usuarios que tienen cuenta web activa y `accountStatus = 'active'` para la mayoría.

Los `Patients` se insertan después de `Users` e `MedicalInsurances`. De los 25 pacientes, la mayoría tiene un `userId` vinculado a un User existente, pero al menos cinco tienen `userId = NULL` para simular pacientes registrados manualmente por la secretaria vía WhatsApp. El trigger `trg_create_medical_record` se dispara automáticamente con cada INSERT en `Patients` y crea el `MedicalRecord` correspondiente con `bloodType = NULL`. El script no inserta en `MedicalRecords` directamente; en cambio, hace un SELECT después de insertar todos los pacientes para verificar que el trigger haya creado los 25 registros. Si el conteo no coincide, el script lanza un error.

Los `ScheduleEvents` se insertan en un rango de seis semanas: dos semanas pasadas con eventos de tipo `appointment` en estado `completed` o `cancelled`, la semana actual con una mezcla de `busy` y `available`, y tres semanas futuras con slots `available` y algunos bloques de `vacation` y `meeting`. Esto produce un calendario realista donde el sistema puede mostrar disponibilidad futura y la doctora puede ver su agenda pasada. Se insertan al menos 25 eventos distribuidos en ese rango.

Las `MedicalAppointments` vinculan pacientes con slots de tipo `appointment`. Al insertar cada cita, el trigger `trg_whatsapp_on_appointment` crea automáticamente un `WhatsAppMessage` de confirmación y `trg_block_event_on_appointment` marca el slot como `busy`. El script inserta 25 citas y luego verifica que existan 25 mensajes de confirmación en `WhatsAppMessages`. Para los slots pasados que corresponden a citas completadas, el script también inserta registros en `ClinicalConsultations` — al menos 25 consultas con síntomas, diagnósticos y tratamientos genéricos pero coherentes (hipertensión, gripe, diabetes tipo 2, etc.).

La sección DML del script incluye ejemplos explícitos de UPDATE y DELETE para cumplir el rubric. El UPDATE modifica el `accountStatus` de un usuario de `active` a `suspended` y corrige el `whatsappPhone` de un paciente. El DELETE elimina un `ScheduleEvent` de tipo `available` que no tiene cita asociada, demostrando que el delete en cascade no afecta citas existentes. Finalmente, el script ejecuta un SELECT de verificación que muestra el conteo de registros por tabla en un formato legible.

## Skills relevantes

- `/tech-drizzle` — el seed se escribe como un script TypeScript que usa `db.insert()` con `.values([...])` en lotes y `db.transaction()` para garantizar que o todo el seed se aplica o nada; el script se puede ejecutar con `bun run db/seed.ts` desde `apps/api`
