# Roles de PostgreSQL

## ¿Qué hace esta parte del sistema?

Esta parte define cuatro roles de usuario directamente en PostgreSQL con privilegios diferenciados por perfil. A diferencia del control de acceso que se implementa en la capa de aplicación (el campo `role` en la tabla `Users` y la lógica de autorización en los endpoints), los roles de PostgreSQL operan a nivel de motor de base de datos: si un rol no tiene `SELECT` sobre una tabla, la query falla antes de llegar al código de la aplicación. Esto cumple el criterio 7 del rubric y añade una capa de defensa en profundidad al sistema.

Los cuatro roles modelan los cuatro perfiles del sistema: paciente, secretaria, doctora y administradora. Cada rol recibe exactamente los privilegios que necesita para su función y ninguno más.

## ¿Quién la usa?

El desarrollador que aplica los roles en el script de migración inicial, y el evaluador académico que verifica los privilegios con `\dp` en psql.

## ¿Cómo funciona?

`rol_paciente` tiene el nivel de acceso más restringido. Solo puede hacer `SELECT` sobre `ScheduleEvents`, y únicamente sobre filas con `availabilityStatus = 'available'` — esto se implementa con una vista con `SECURITY BARRIER` o con Row Level Security (RLS) en PostgreSQL. También tiene `INSERT` sobre `MedicalAppointments` para reservar citas. No tiene ningún acceso a `MedicalRecords`, `ClinicalConsultations`, `Users`, ni a los datos de otros pacientes. En la práctica, el portal del paciente usa una connection string con credenciales de este rol cuando ejecuta queries en nombre de un paciente autenticado.

`rol_secretaria` tiene acceso operativo al núcleo administrativo del sistema: `SELECT`, `INSERT` y `UPDATE` sobre `Patients`, `ScheduleEvents`, `MedicalAppointments` y `WhatsAppMessages`. También tiene `SELECT` sobre `Users` y `MedicalInsurances` para poder buscar pacientes y aseguradoras al registrar un nuevo paciente. Explícitamente no tiene ningún privilegio sobre `ClinicalConsultations` ni sobre la columna `doctorPrivateNotes`; si en el futuro se decide exponer algunos campos de las consultas a la secretaria, ese cambio debe ser deliberado y documentado. La restricción sobre `doctorPrivateNotes` se puede implementar con column-level privileges: `GRANT SELECT (id, recordId, appointmentId, presentedSymptoms, bloodPressure, weightKg, mainDiagnosis, prescribedTreatment) ON ClinicalConsultations TO rol_secretaria`, omitiendo `doctorPrivateNotes` de la lista.

`rol_doctora` tiene acceso completo a todas las tablas clínicas: `SELECT`, `INSERT`, `UPDATE` y `DELETE` sobre `MedicalRecords` y `ClinicalConsultations` incluyendo `doctorPrivateNotes`. También tiene `SELECT`, `INSERT`, `UPDATE` y `DELETE` sobre `ScheduleEvents` para gestionar su propia agenda. No tiene permisos de gestión sobre `Users`, `Sessions`, `Accounts` ni `Verifications` — esas tablas son territorio del admin. La doctora puede ver `Patients` y `MedicalInsurances` en modo `SELECT` para acceder a la información del paciente durante la consulta.

`rol_admin` tiene `ALL PRIVILEGES` sobre todas las tablas del schema. Este rol corresponde a la doctora cuando actúa como administradora del sistema — por ejemplo, para crear usuarios, activar o suspender cuentas, o revisar logs de acceso. En la práctica, el backend usa las credenciales del `rol_admin` para las operaciones del módulo de administración, y credenciales de roles específicos para los demás módulos. Los roles se crean con `CREATE ROLE ... WITH LOGIN PASSWORD '...'` y se asignan los privilegios con `GRANT ... ON TABLE ... TO ...`. Todo esto se aplica usando `db.execute(sql\`GRANT ...\`)` en el script de migración inicial, que solo debe correr una vez contra la base de datos de producción o evaluación.

## Skills relevantes

- `/tech-drizzle` — los roles y sus privilegios se aplican fuera del schema de Drizzle, ejecutando las sentencias `CREATE ROLE` y `GRANT` con `db.execute(sql\`...\`)` en un script de migración separado; Drizzle no gestiona roles de PostgreSQL de forma nativa, así que el script se incluye en la carpeta `db/migrations/` como un archivo SQL numerado que drizzle-kit no genera pero sí puede incluir en la secuencia de migraciones
