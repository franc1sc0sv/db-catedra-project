# Spec — Datos Semilla

## Propósito

Script TypeScript que puebla la base de datos con datos de prueba realistas. Cumple el requisito académico de 25+ registros por tabla y demuestra las cuatro operaciones DML: INSERT, SELECT, UPDATE, DELETE.

## Orden de inserción

El script respeta las dependencias de clave foránea y el orden en que los triggers crean registros derivados:

1. **MedicalInsurances** — sin dependencias externas
2. **Users** — sin dependencias externas
3. **Patients** — referencia `Users` (mayoría) y `MedicalInsurances`
4. *(trigger automático)* **MedicalRecords** — creados por trigger al insertar Patients
5. **ScheduleEvents** — referencia `Users` (doctores/secretarias)
6. **MedicalAppointments** — referencia `Patients`, `ScheduleEvents`, `Users`
7. *(triggers automáticos)* **WhatsAppMessages** (confirmación) + bloqueo de slots en ScheduleEvents
8. **ClinicalConsultations** — referencia `MedicalAppointments` completadas

## Conteos por tabla

| Tabla | Registros semilla | Notas |
|---|---|---|
| MedicalInsurances | 25 | Distribuidos entre todos los valores del enum `coverageType` |
| Users | 25 | Mezcla: pacientes, doctores, secretarias, admin; contraseñas hasheadas; `accountStatus = active` |
| Patients | 25 | 20 con `userId` vinculado, 5 con `userId = NULL` (solo WhatsApp) |
| MedicalRecords | 25 (trigger) | Verificados con SELECT tras insertar Patients |
| ScheduleEvents | 25+ | 2 semanas pasadas (completed/cancelled), semana actual (busy+available), 3 semanas futuras (available + vacation/meeting) |
| MedicalAppointments | 25 | Triggers crean WhatsAppMessages y marcan slots como busy |
| WhatsAppMessages | 25+ (trigger) | Verificados con SELECT tras insertar MedicalAppointments |
| ClinicalConsultations | 25+ | Solo para citas pasadas completadas; diagnósticos coherentes (hipertensión, gripe, diabetes tipo 2) |

## Estrategia de verificación de triggers

Después de cada batch que activa triggers, el script ejecuta un `SELECT COUNT(*)` y lanza un error si el conteo no coincide con el esperado:

```typescript
const [{ count }] = await db.select({ count: sql`count(*)` }).from(medicalRecords);
if (Number(count) !== 25) throw new Error(`Expected 25 MedicalRecords, got ${count}`);
```

## Demostración de DML explícita

Además de los INSERT masivos, el script incluye:

- **UPDATE**: cambia `accountStatus` de `active` a `suspended` en 2 usuarios de prueba, y corrige un `whatsappPhone` con formato incorrecto.
- **DELETE**: elimina 1 `ScheduleEvent` de tipo `available` que no tiene `MedicalAppointment` asociada.
- **SELECT**: conteos de verificación por tabla (descritos arriba) y una consulta de muestra con JOIN entre `Patients`, `Users` y `MedicalInsurances`.

## Atomicidad

Todo el seed corre dentro de `db.transaction()`. Si cualquier verificación falla, la transacción hace rollback y el error se imprime con el conteo actual de cada tabla.

## Ejecución

```bash
bun run db:seed          # desde la raíz del monorepo
# o directamente:
cd packages/db && bun run seed
```

El script se agrega al `scripts` de `packages/db/package.json`:

```json
"db:seed": "bun run src/seed.ts"
```
