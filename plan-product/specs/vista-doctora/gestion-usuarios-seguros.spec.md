# Gestión de Usuarios y Aseguradoras

## ¿Qué hace esta parte del sistema?

Esta pantalla agrupa las dos tareas administrativas que tienen impacto en la operación global del sistema. Por un lado, la doctora puede ver y modificar todos los usuarios registrados: cambiar su rol, cambiar el estado de su cuenta o eliminar cuentas que ya no deben existir. Por otro, puede mantener el catálogo de aseguradoras que aparece como opción al crear o editar pacientes.

Ambas funcionalidades viven juntas porque comparten el mismo perfil de uso — son tareas de mantenimiento que ocurren con poca frecuencia y requieren acceso de administradora — pero cada una tiene su propia tabla dentro de la pantalla con sus propias acciones.

## ¿Quién la usa?

La doctora en su rol de administradora del sistema, con acceso restringido por rol admin.

## ¿Cómo funciona?

La sección de usuarios muestra todos los registros de la tabla Users en una tabla con columnas para nombre, email, rol actual y estado de la cuenta. Desde cada fila la doctora puede cambiar el rol entre patient, doctor, receptionist y admin, cambiar el estado entre active, inactive y suspended, o eliminar la cuenta. El sistema impide que la doctora elimine su propia cuenta: si intenta hacerlo, la acción no procede y recibe un mensaje que explica por qué.

La sección de aseguradoras es más simple: una lista de registros en MedicalInsurances con nombre de aseguradora y tipo de cobertura. La doctora puede agregar nuevas aseguradoras, editar el nombre o tipo de cobertura de una existente, o eliminar una que ya no aplica. Eliminar una aseguradora con pacientes activos vinculados no ocurre silenciosamente: el sistema muestra primero cuántos pacientes serían afectados y pide confirmación explícita. Si la doctora confirma, el registro se elimina y los pacientes quedan sin aseguradora asignada; si no confirma, no pasa nada.

Todos los cambios en esta sección tienen efecto inmediato y no hay un flujo de aprobación intermedio, por lo que la UI presenta las acciones destructivas con un tono visual más cauteloso — botones de eliminar con confirmación, no solo un clic.

## Skills relevantes

- `/tech-drizzle` — SELECT, UPDATE y DELETE en Users y MedicalInsurances; conteo de pacientes afectados antes de eliminar una aseguradora.
- `/tech-elysia` — rutas CRUD para /users (cambio de rol y estado, eliminación) y /insurances (alta, edición, baja con validación de dependencias).
- `/organization-best-practices` — RBAC que restringe el acceso a esta sección exclusivamente al rol admin, bloqueando cualquier otro rol en la ruta y en las rutas API.
- `/frontend-design` — tablas de administración con acciones inline por fila, modal de confirmación para eliminación de aseguradoras con conteo de afectados y bloqueo visual de la acción de eliminación propia.
