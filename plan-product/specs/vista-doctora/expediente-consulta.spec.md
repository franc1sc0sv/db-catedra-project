# Expediente y Registro de Consulta

## ¿Qué hace esta parte del sistema?

El expediente es la pantalla más densa de la vista de la doctora. Cuando selecciona una cita desde la agenda, el sistema abre toda la información disponible sobre ese paciente en un solo lugar: quién es, cuál es su historial clínico base y qué ocurrió en su última consulta. La doctora puede revisar esto antes de llamar al paciente, durante la atención o inmediatamente después.

La carga del expediente usa PatientFullRecordView, que consolida datos demográficos del paciente (nombre, DUI, fecha de nacimiento, aseguradora), el MedicalRecord base (tipo de sangre, alergias, antecedentes familiares, condiciones crónicas) y la última consulta clínica registrada. Todo eso aparece en la parte superior de la pantalla como información de solo lectura.

En la parte inferior vive el formulario de la consulta actual. La doctora registra los síntomas presentados, presión arterial, peso en kilogramos, diagnóstico principal, tratamiento recetado y notas privadas. Las notas privadas tienen una marca visual explícita que indica que solo la doctora puede verlas — el paciente nunca accede a ese campo. Al guardar, el sistema ejecuta sp_complete_consultation, que crea el registro en ClinicalConsultations vinculado al appointmentId y al recordId, y cambia el availabilityStatus del ScheduleEvent correspondiente a completed en una sola operación atómica.

## ¿Quién la usa?

La doctora, en el contexto de cada consulta médica, accediendo desde la agenda del día.

## ¿Cómo funciona?

La doctora llega a esta pantalla desde el botón de la agenda. El sistema carga PatientFullRecordView para ese paciente y presenta el expediente de forma inmediata. Si la consulta ya fue registrada anteriormente — por ejemplo, la doctora la abrió antes y la guardó — el formulario aparece en modo lectura mostrando los datos existentes, con una opción visible para editar si necesita corregir algo.

Si la doctora intenta guardar el formulario sin haber llenado el diagnóstico principal, la validación lo impide antes de llegar al servidor. El campo de diagnóstico es obligatorio y el botón de guardar no se activa hasta que tenga contenido. El resto de los campos de vitales son opcionales, pero el formulario los agrupa con claridad para que no se omitan por accidente.

Una vez que el guardado es exitoso, la cita aparece como completada en la agenda y el expediente del paciente ya incluye esta consulta como la más reciente. No hay flujo de confirmación ni pasos intermedios: el stored procedure garantiza que todo ocurre de forma atómica, así que o todo se registra o nada cambia.

## Skills relevantes

- `/tech-drizzle` — query sobre PatientFullRecordView por patientId, e INSERT en ClinicalConsultations usando el stored procedure sp_complete_consultation.
- `/backend-architecture` — use case CompleteConsultation que encapsula la llamada al stored procedure y maneja los errores de negocio.
- `/frontend-design` — vista dividida en dos paneles: panel superior con historial base de solo lectura y panel inferior con formulario de consulta activa.
- `/tailwind-css-patterns` — formulario clínico con campos de vitales agrupados, etiqueta visual de notas privadas y estados de validación inline.
