# Product Roadmap

> Team assignments and sequencing: see [work-division.md](./work-division.md)

Construimos primero lo que desbloquea todo lo demás: la base de datos y la lógica de negocio central. Una vez que los datos fluyen de forma confiable, cada pantalla del sistema se puede construir encima sin reescribir nada.

## MVP — What ships first

La primera versión entregable permite que un paciente cree su cuenta, consulte los horarios disponibles y reserve una cita sin necesitar a la secretaria. La secretaria puede ver la agenda del día, bloquear horarios y registrar manualmente a quienes lleguen por WhatsApp. La doctora consulta sus citas, llena el expediente clínico al terminar cada consulta y administra usuarios y catálogos. Todo esto ocurre sobre una sola base de datos PostgreSQL que reemplaza WhatsApp y Google Calendar como sistemas de coordinación. Para el MVP se omiten integraciones externas avanzadas como notificaciones automáticas por WhatsApp o sincronización bidireccional con Google Calendar; estas dependen de que los flujos internos estén estables primero.

## Sections

### 1. Capa de Datos

Es la infraestructura completa de PostgreSQL: tablas, relaciones, procedimientos almacenados, subconsultas de disponibilidad, roles de base de datos y datos semilla para pruebas. Va primero porque todas las pantallas del sistema consumen esta capa; sin ella, nada más puede construirse ni probarse.

### 2. Portal del Paciente

Le da al paciente una vista en tiempo real de los horarios disponibles y le permite reservar, modificar o cancelar su propia cita desde el navegador. Elimina la dependencia de WhatsApp para solicitar citas y evita la duplicidad de reservas que ocurría cuando la secretaria gestionaba peticiones en paralelo.

### 3. Panel de Secretaria

Le ofrece a la secretaria una vista consolidada de la agenda diaria, con herramientas para bloquear franjas horarias y registrar manualmente a pacientes que no tengan cuenta web. Reduce la carga de tareas repetitivas y centraliza en un solo lugar lo que antes se repartía entre mensajes de WhatsApp y entradas manuales en Google Calendar.

### 4. Vista Doctora / Admin

Permite a la doctora consultar su agenda del día, completar el expediente clínico de cada paciente al terminar la consulta y administrar usuarios, roles y catálogos del sistema. Al unir agenda e historial clínico en una sola vista, elimina la fragmentación que antes separaba los datos demográficos del historial médico.
