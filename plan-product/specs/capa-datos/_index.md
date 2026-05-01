# Capa de Datos

La capa de datos es el núcleo de AgendaMed. Antes de construir cualquier interfaz o endpoint, el schema de PostgreSQL debe estar correctamente modelado, los procedimientos almacenados implementados, los datos de prueba cargados y los roles de base de datos definidos. Todo lo que vive directamente en la base de datos — tablas, vistas, triggers, stored procedures, roles, y el seed inicial — se documenta en esta sección.

Esta sección cubre los entregables que el rubric de la cátedra evalúa directamente: schema relacional con constraints y enums correctos, stored procedures con lógica transaccional, subconsultas con técnicas distintas, un seed con al menos 25 registros por tabla y los cuatro tipos de DML, y roles de PostgreSQL con privilegios diferenciados por perfil de usuario.

## What's inside this section

Esta sección se divide en cinco partes que deben implementarse en orden, ya que cada una depende de que la anterior esté correcta.

- **correcciones-schema** — Tres ajustes al schema actual necesarios antes de cualquier otra implementación.
- **procedimientos-almacenados** — Cuatro stored procedures que encapsulan las operaciones de negocio más críticas.
- **subconsultas** — Tres subconsultas standalone que demuestran el uso de esta técnica con propósitos distintos.
- **datos-semilla** — Script de seed con 25+ registros por tabla y ejemplos de las cuatro operaciones DML.
- **roles-postgresql** — Definición de cuatro roles de PostgreSQL con privilegios diferenciados.

## What data does this section work with?

Esta sección trabaja con la totalidad del schema de AgendaMed: las once tablas principales (Users, Sessions, Accounts, Verifications, MedicalInsurances, Patients, MedicalRecords, ScheduleEvents, MedicalAppointments, ClinicalConsultations, WhatsAppMessages), las dos vistas existentes (DailyScheduleView, PatientFullRecordView), y los tres triggers ya implementados.

## What does this section depend on?

Ninguna — esta sección va primero y es prerequisito de todas las demás.

## Skills relevantes

- `/tech-drizzle` — schema, migraciones y queries tipadas; los stored procedures y roles se ejecutan con `db.execute(sql\`...\`)` desde Drizzle
- `/backend-architecture` — los stored procedures son consumidos desde los use cases del módulo Elysia en `apps/api`
- `/typescript-advanced-types` — tipos inferidos del schema con `$inferSelect` / `$inferInsert` para los DTOs que reciben los resultados de los stored procedures
