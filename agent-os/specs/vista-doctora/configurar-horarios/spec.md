# Spec: Configurar Horarios

## Propósito

La doctora define su disponibilidad futura generando bloques de tiempo que los pacientes pueden reservar. Cada bloque produce un registro `ScheduleEvent` con `eventType='appointment'` y `availabilityStatus='available'`.

## Interacción: Weekly Grid

### Paso 1 — Configurar parámetros

El formulario presenta tres controles:

1. **Selector de días** — Casillas de verificación para cada día de la semana (Lunes a Domingo). La doctora selecciona los días en que estará disponible.
2. **Rango de tiempo** — Dos selectores de hora: inicio (ej. 08:00) y fin (ej. 12:00).
3. **Granularidad de bloque** — Selector de duración por cita: 15, 30, 45 o 60 minutos.

### Paso 2 — Vista previa

Al confirmar los parámetros, el sistema calcula los bloques resultantes sin persistirlos y muestra una lista de preview con fecha, hora de inicio y hora de fin de cada bloque.

El rango de generación por defecto es la **semana actual** comenzando desde el siguiente día hábil disponible (no se generan bloques en el pasado).

### Paso 3 — Confirmar

La doctora presiona "Confirmar horario". El sistema ejecuta el bulk INSERT.

## Algoritmo de Cálculo de Slots

```
Para cada día seleccionado en [semana actual]:
  currentTime = horaInicio
  Mientras currentTime + granularidad <= horaFin:
    slot = { fecha: día, inicio: currentTime, fin: currentTime + granularidad }
    agregarALista(slot)
    currentTime += granularidad
```

El cálculo ocurre en el servidor (use case), no en el cliente. El cliente solo muestra el preview devuelto por el endpoint.

## Detección de Solapamiento

Antes del INSERT, el use case consulta los `ScheduleEvents` existentes que intersecten con cualquiera de los bloques propuestos.

Estrategia: un bloque candidato solapa si existe un evento con el mismo `doctorId` cuyo intervalo `[startDatetime, endDatetime)` se intersecta con el candidato.

Condición SQL de solapamiento:
```
existing.startDatetime < candidate.endDatetime
AND existing.endDatetime > candidate.startDatetime
```

Solo se omiten los bloques en conflicto; el resto se insertan con normalidad.

La respuesta incluye contadores: `{ created: N, skipped: M }`.

El mensaje de feedback al usuario es: _"X horarios creados. Y ignorados por solapamiento."_

## Sincronización con Google Calendar (Opcional)

Si la doctora tiene configurada la integración de Google Calendar (verificado por la existencia de credenciales en su perfil), cada slot insertado se sincroniza vía la API de Google Calendar. El campo `googleEventId` almacena el ID del evento creado, `googleHtmlLink` el enlace al evento, y `syncStatus` refleja el estado de la operación (`synced` | `error` | `pending`).

La sincronización es transparente: la doctora no realiza ninguna acción adicional. Si la integración no está configurada, los slots se crean normalmente con `syncStatus = null`.

## Alcance MVP

- Generación para la semana en curso (7 días a partir del día siguiente al actual).
- No se soporta generación multi-semana en esta iteración.
- El preview es de solo lectura; no se puede editar bloques individuales antes de confirmar.
