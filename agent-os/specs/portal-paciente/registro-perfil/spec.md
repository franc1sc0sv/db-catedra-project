# Spec: Registro y Perfil del Paciente

## Resumen

Flujo de dos pasos que permite a un paciente nuevo crear su cuenta en el portal y completar su ficha personal. Al finalizar, el sistema crea el registro en `Patients` y un `MedicalRecord` vacío mediante un trigger de base de datos.

---

## Paso 1 — Registro de cuenta (Better Auth)

El paciente ingresa correo electrónico y contraseña. Better Auth crea el registro en la tabla `users` y envía un correo de verificación.

- Si el correo ya existe en el sistema: se redirige al login con el mensaje *"Ya tienes una cuenta, inicia sesión"*.
- El paciente debe hacer clic en el enlace de verificación antes de poder continuar al paso 2.
- Si accede al portal sin haber verificado el correo: se muestra una pantalla de advertencia con opción de reenviar el enlace.

### Política de contraseña

- Mínimo 8 caracteres.
- Al menos una letra mayúscula, una minúscula y un dígito.
- El enlace de verificación caduca en 24 horas; se puede reenviar desde la pantalla de advertencia.

---

## Paso 2 — Completar datos personales

Una vez verificado el correo, el paciente completa su ficha con los siguientes campos:

| Campo | Tipo | Validación |
|---|---|---|
| `firstName` | string | requerido, mín. 1 |
| `lastName` | string | requerido, mín. 1 |
| `dui` | string | exactamente 9 caracteres numéricos |
| `birthDate` | date | requerido, fecha pasada |
| `whatsapp` | string | requerido, formato E.164 |
| `insuranceId` | uuid | opcional, FK a `MedicalInsurances` |

Al guardar el formulario se ejecuta un `INSERT` en `Patients` con `userId` igual al `id` del usuario autenticado.

---

## Lógica de unicidad del DUI

| Caso | Acción |
|---|---|
| DUI no existe | `INSERT` nuevo registro en `Patients` |
| DUI existe y `userId IS NULL` | `UPDATE Patients SET userId = :userId` (vincula cuenta manual preexistente) |
| DUI existe y `userId IS NOT NULL` (distinto) | Error: *"Ese DUI ya está asociado a otra cuenta"* |
| DUI existe y `userId = userId actual` | Idempotente; no hace nada (upsert seguro) |

---

## Trigger de base de datos

Al insertar un nuevo registro en `Patients` (o al vincular uno sin `userId`), un trigger de PostgreSQL crea automáticamente un `MedicalRecord` con:

```sql
INSERT INTO medical_records (patient_id, blood_type)
VALUES (:dui, NULL);
```

El trigger no se activa si el `MedicalRecord` ya existe para ese `patient_id`.

---

## Integración con Better Auth

- La creación de usuario se delega completamente a Better Auth (`signUp.email`).
- La verificación de correo usa el plugin `emailVerification` de Better Auth.
- El frontend consulta `useSession()` para determinar si el correo está verificado antes de mostrar el paso 2.
- El `userId` para el `INSERT` en `Patients` se toma del token de sesión de Better Auth en el backend (nunca del cliente).

---

## Flujo de navegación

```
/register  →  (Better Auth signUp)  →  /verify-email (pantalla de espera)
                                              ↓  (link clicked)
                                       /complete-profile  →  /dashboard
```

Si el usuario autenticado ya tiene un `Patient` vinculado, `/complete-profile` redirige directamente a `/dashboard`.
