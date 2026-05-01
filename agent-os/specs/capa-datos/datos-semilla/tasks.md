# Tasks — Datos Semilla

> Implementación completada: 2026-04-28

## Task 1 ✅ — Spec aprobado
Shape, spec y tasks definidos. Listo para implementar.

---

## Task 2 [x] — Crear archivo seed.ts
**Ruta:** `packages/db/src/seed.ts`
**Skill:** `/tech-drizzle`

Crear el archivo con la estructura base:
- Importar el cliente Drizzle desde `packages/db/src/index.ts`
- Importar todas las tablas relevantes del schema
- Definir función `main()` async que envuelve todo en `db.transaction()`
- Agregar `main().catch(console.error)` al final

**Criterio de éxito:** El archivo compila sin errores con `bun --check src/seed.ts`.

---

## Task 3 [x] — Agregar script al package.json
**Ruta:** `packages/db/package.json`
**Skill:** `/tech-drizzle`

Agregar entrada en `scripts`:
```json
"db:seed": "bun run src/seed.ts"
```

También agregar en el `package.json` raíz del monorepo si existe un script `db:seed` que use `turbo`.

**Criterio de éxito:** `bun run db:seed --help` no produce error de "script not found".

---

## Task 4 [x] — Implementar batch: MedicalInsurances (25 registros)
**Ruta:** `packages/db/src/seed.ts`
**Skill:** `/tech-drizzle`

Insertar 25 `MedicalInsurances` con `db.insert(medicalInsurances).values([...])`. Distribuir los valores del enum `coverageType` uniformemente (si hay N valores, insertar al menos 25/N registros de cada uno).

**Criterio de éxito:** SELECT posterior devuelve 25 filas.

---

## Task 5 [x] — Implementar batch: Users (25 registros)
**Ruta:** `packages/db/src/seed.ts`
**Skill:** `/tech-drizzle`

Insertar 25 `Users`. Usar `bcryptjs` o el hasher que ya usa el proyecto para hashear passwords. Distribución de roles:
- 8 pacientes (`role = patient`)
- 8 doctores (`role = doctor`)
- 5 secretarias (`role = secretary`)
- 4 administradores (`role = admin`)

Todos con `accountStatus = active`.

**Criterio de éxito:** SELECT devuelve 25 filas con roles distribuidos correctamente.

---

## Task 6 [x] — Implementar batch: Patients (25 registros) + verificar MedicalRecords
**Ruta:** `packages/db/src/seed.ts`
**Skill:** `/tech-drizzle`

Insertar 25 `Patients`:
- 20 con `userId` apuntando a usuarios con `role = patient`
- 5 con `userId = NULL` (pacientes solo-WhatsApp con `whatsappPhone` válido)

Después del insert, ejecutar SELECT COUNT sobre `medicalRecords` y lanzar error si no es 25.

**Criterio de éxito:** No se lanza error; log muestra "25 MedicalRecords verified".

---

## Task 7 [x] — Implementar batch: ScheduleEvents (25+ registros)
**Ruta:** `packages/db/src/seed.ts`
**Skill:** `/tech-drizzle`

Insertar 25+ `ScheduleEvents` en cuatro bloques temporales relativos a `new Date()`:
- 2 semanas pasadas: eventos con `status = completed` y `status = cancelled`
- Semana actual: mezcla de `status = busy` y `status = available`
- 3 semanas futuras: mayoría `status = available`, algunos `status = vacation` y `status = meeting`

Todos asignados a usuarios con `role = doctor` o `role = secretary`.

**Criterio de éxito:** SELECT devuelve 25+ filas con la distribución de status esperada.

---

## Task 8 [x] — Implementar batch: MedicalAppointments (25 registros) + verificar WhatsAppMessages
**Ruta:** `packages/db/src/seed.ts`
**Skill:** `/tech-drizzle`

Insertar 25 `MedicalAppointments` referenciando `Patients` y `ScheduleEvents` existentes. Los triggers deben:
1. Crear un `WhatsAppMessage` de confirmación por cita
2. Marcar el `ScheduleEvent` asociado como `busy`

Después del insert, verificar con SELECT COUNT que existen 25+ `WhatsAppMessages`.

**Criterio de éxito:** No se lanza error; log muestra "25 WhatsAppMessages verified".

---

## Task 9 [x] — Implementar batch: ClinicalConsultations (25+ registros)
**Ruta:** `packages/db/src/seed.ts`
**Skill:** `/tech-drizzle`

Insertar 25+ `ClinicalConsultations` para citas pasadas con `status = completed`. Usar diagnósticos coherentes y en español:
- Hipertensión arterial esencial (I10)
- Influenza (J11)
- Diabetes mellitus tipo 2 (E11)
- Otros diagnósticos comunes

**Criterio de éxito:** SELECT devuelve 25+ filas con `appointmentId` válido.

---

## Task 10 [x] — Implementar DML explícitos (UPDATE + DELETE + SELECT de muestra)
**Ruta:** `packages/db/src/seed.ts`
**Skill:** `/tech-drizzle`

Al final de la transacción, ejecutar:

1. **UPDATE** — cambiar `accountStatus` a `suspended` en 2 usuarios de prueba designados:
   ```typescript
   await db.update(users).set({ accountStatus: 'suspended' }).where(eq(users.email, 'test-suspended@seed.local'));
   ```

2. **UPDATE** — corregir un `whatsappPhone` con formato incorrecto:
   ```typescript
   await db.update(patients).set({ whatsappPhone: '+50312345678' }).where(eq(patients.whatsappPhone, '12345678'));
   ```

3. **DELETE** — eliminar 1 `ScheduleEvent available` creado específicamente para ser borrado (sin cita asociada):
   ```typescript
   await db.delete(scheduleEvents).where(eq(scheduleEvents.id, deletableEventId));
   ```

4. **SELECT** — query de muestra con JOIN: listar nombre del paciente, nombre del usuario y nombre de su seguro médico.

**Criterio de éxito:** Cada DML se ejecuta sin error; log imprime el resultado del SELECT de muestra.

---

## Task 11 [x] — Agregar logs y manejo de errores
**Ruta:** `packages/db/src/seed.ts`
**Skill:** `/tech-drizzle`

- Log al inicio: "Seeding database..."
- Log después de cada batch: "Inserted N [TableName]"
- Log final: "Seed completed successfully"
- En caso de error: imprimir mensaje + conteos actuales de cada tabla para diagnóstico

**Criterio de éxito:** `bun run db:seed` produce salida legible que permite verificar visualmente cada paso.
