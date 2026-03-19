# Historias de usuario

## Administrador

### 1. Gestión de cursos

**Como** admin, **quiero** gestionar los cursos **para** tener: Ver listado, crear nuevo curso, editar curso y eliminar curso.

**Nota:** Preguntar por sección en la carga de datos

**Criterios de aceptación:**

- El curso debe tener al menos los siguientes campos: Nombre, código, carreras con semestre y tipo (obligatorio u optativo), tipo_horario (mañana, tarde, ambos), tiene_lab (boolean).
- No deben haber cursos con el mismo código
- Un curso puede estar en múltiples carreras y semestres. Ej. Administración de Empresas para Ing. Industrial en el 8vo semestre y Administración de Empresas para Ing. Sistemas en 6to Semestre. Por lo menos debe haber una carrera y semestre asignado a ese curso a menos que el curso se marque como `Área común`.
- Si el curso es de `Área común`, debe tener un semestre asignado.
- Si el curso es de `Área común`, debe indicar si es obligatorio
- Si el curso ha sido usado para crear un horario no puede eliminarse
- El curso debe tener el número de periodos que ocupa (por defecto 1). Por ejemplo para algunos cursos como Matemática básica 1, son 2 periodos.

### 2. Gestión de salones

**Como** admin, **quiero** gestionar los salones **para** tener: Ver listado, crear nuevo salón, editar salón y eliminar salón.

**Criterios de aceptación:**

- El salón debe tener al menos los siguientes campos: Nombre del salón, id, tipo (lab, curso o ambos), cantidad de estudiantes, tipo_horario (mañana, tarde o ambos).
- No deben haber salones con el mismo nombre

### 3. Gestión de docentes

**Como** admin, **quiero** gestionar a los docentes **para** tener: Ver listado, crear nuevo docente, editar docente y eliminar docente.

**Criterios de aceptación:**

- El docente debe tener al menos los siguientes campos: Nombre, registro de personal, hora de entrada y salida.
- Un docente puede ser asignado “por defecto” a uno o más cursos (pueden ser 0). Esto hará que, en la configuración de un horario, aparezca por defecto como uno de los docentes “preferidos”, sin embargo esto se puede alterar.

### 4. Carga de datos

**Como** admin, **quiero** tener la opción de cargar datos de cursos, salones, docentes y relaciones de docentes **para** tener datos en el sistema.

**Criterios de aceptación:**

- La carga debe ser por medio de archivos csv
- El formato de dichos archivos es el siguiente:

  Cursos: Nombre, código, carrera, semestre, sección, tipo (obligatorio u optativo).
  Salones: Nombre del salón, id.
  Docentes: Nombre, registro de personal, hora de entrada y salida.
  Relación Docente-Curso: curso_código, docente_registro


### 5. Configuración de generación de horarios:

**Como** admin, **quiero** poder crear “configuraciones” de generación de horarios **para** crear y analizar múltiples escenarios.

**Criterios de aceptación:**

- El “tiempo” por periodo debe ser 50 minutos por defecto, sin embargo este valor puede ser configurado entre un rango de 10 minutos (40 minutos a 60 minutos)
- Se puede modificar los rangos de las jornadas
- Por defecto se cargarán todos los salones disponibles, pudiendo configurar cuáles son de laboratorio, curso o ambos (se deberán cargar el tipo por defecto establecido en cada curso). Mostrar la cantidad de estudiantes, si existe.
- Un salón por defecto tiene un tipo de horario (mañana, tarde o ambos). Esto puede ser modificado en la configuración.
- Al agregar un curso, se deben cargar sus docentes por defecto, aunque estos se pueden modificar.
- Un curso se puede asignar un salón por defecto (de los salones seleccionados).
- A un curso puede se puede asignar la cantidad de secciones (por defecto 1 y máximo 2).
- Un curso puede ser fijado a un horario
- Un curso puede ser marcado como: Sin salón
- Un curso por defecto tiene un tipo de horario (mañana, tarde, ambos). Esto puede ser modificado en la configuración
- Se podrá definir un número máximo de generaciones (si no se aplica un valor óptimo).
- Se podrá configurar la cantidad de población inicial (por defecto: *Definir)*
- Se podrá definir el criterio de finalización
- Se podrá definir métodos de selección, cruce y mutación

### 6. Modificación Manual de Horarios Generados

**Como** admin, **quiero** poder modificar los horarios generados **para** ajustarlos a mis necesidades.

**Criterios de aceptación:**

- El sistema debe mostrarme advertencias de los posibles choques, sin embargo debe permitirme hacer los cambios

### 7. Generación de Reportes y Estadísticas

**Como** admin, **quiero** poder ver reportes y estadísticas **para** obtener detalles de los horarios y de las ejecuciones de los algoritmos

- Las columnas representan los salones.
- Las filas representan los horarios.
- Generación de horario con cursos y laboratorios
- Generación de horario solo de cursos.
- Generación de horario solo de laboratorios.
- Generación de horario con filtrado por año, semestre o carrera.