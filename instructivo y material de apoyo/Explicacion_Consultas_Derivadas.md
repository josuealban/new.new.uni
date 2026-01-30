# Explicación de Consultas Derivadas - Parte 1

Este documento explica las **4 consultas derivadas** implementadas utilizando el ORM Prisma. Las consultas derivadas son aquellas que se construyen usando los métodos nativos del ORM sin escribir SQL directo.

---

## 1. Listar Estudiantes Activos con su Carrera

### Ubicación del Código
- **Service:** `src/academic/student/student.service.ts` - Método `findActiveWithCareer()`
- **Controller:** `src/academic/student/student.controller.ts` - Endpoint `GET /academic/students/status/active`

### Implementación
```typescript
async findActiveWithCareer() {
    return this.dataService.student.findMany({
        where: { isActive: true },
        include: { career: true },
    });
}
```

### Explicación

**¿Qué hace?**
Esta consulta obtiene todos los estudiantes cuyo estado sea activo (`isActive = true`) e incluye la información completa de su carrera asociada.

**Métodos ORM utilizados:**
- **`findMany()`**: Recupera múltiples registros que cumplan con los criterios especificados.
- **`where`**: Filtro de condiciones. Aquí filtramos por `isActive: true`.
- **`include`**: Carga las relaciones (eager loading). En este caso, incluye la entidad `Career` relacionada mediante la FK `careerId`.

**Equivalente SQL:**
```sql
SELECT s.*, c.*
FROM students s
INNER JOIN careers c ON s.career_id = c.id
WHERE s.is_active = true;
```

**¿Por qué es una consulta derivada?**
No escribimos SQL manualmente; el ORM "deriva" la consulta SQL a partir de las opciones que le pasamos (`where`, `include`).

---

## 2. Obtener Materias de una Carrera Específica

### Ubicación del Código
- **Service:** `src/academic/subject/subject.service.ts` - Método `findByCareer(careerId)`
- **Controller:** `src/academic/subject/subject.controller.ts` - Endpoint `GET /academic/subjects/career/:careerId`

### Implementación
```typescript
async findByCareer(careerId: number) {
    return this.dataService.subject.findMany({
        where: { careerId },
        include: { career: true },
    });
}
```

### Explicación

**¿Qué hace?**
Recupera todas las materias (`Subject`) asociadas a una carrera específica mediante su `careerId`, incluyendo los datos de la carrera.

**Métodos ORM utilizados:**
- **`findMany()`**: Busca todos los registros que coincidan.
- **`where: { careerId }`**: Filtra las materias que pertenecen a la carrera especificada (shorthand de `careerId: careerId`).
- **`include: { career: true }`**: Incluye la información completa de la carrera relacionada.

**Equivalente SQL:**
```sql
SELECT s.*, c.*
FROM subjects s
INNER JOIN careers c ON s.career_id = c.id
WHERE s.career_id = ?;
```

**Caso de uso:**
Útil para mostrar el plan de estudios o catálogo de materias de una carrera en particular.

---

## 3. Listar Docentes que Imparten Más de Una Asignatura

### Ubicación del Código
- **Service:** `src/academic/teacher/teacher.service.ts` - Método `findMultiSubjectTeachers()`
- **Controller:** `src/academic/teacher/teacher.controller.ts` - Endpoint `GET /academic/teachers/status/multi-subject`

### Implementación
```typescript
async findMultiSubjectTeachers() {
    const teachers = await this.dataService.teacher.findMany({
        include: { _count: { select: { subjects: true } } }
    });
    return teachers.filter(t => t._count.subjects > 1);
}
```

### Explicación

**¿Qué hace?**
Obtiene todos los docentes que están asignados a más de una materia.

**Métodos ORM utilizados:**
- **`findMany()`**: Recupera todos los docentes.
- **`include: { _count: { select: { subjects: true } } }`**: Prisma cuenta automáticamente cuántas materias tiene cada docente en la tabla intermedia `teacher_subjects`.
- **`.filter()`**: Filtramos en memoria JavaScript los docentes cuyo conteo de materias sea mayor a 1.

**¿Por qué se filtra en memoria?**
Prisma (en versiones estándar sin extensiones) no soporta directamente `HAVING COUNT() > 1` en el método `findMany`. Por eso, primero recuperamos todos los docentes con su conteo y luego filtramos en JavaScript.

**Alternativa con SQL Nativo:**
Para mayor eficiencia en bases de datos grandes, se podría usar `$queryRaw` con `GROUP BY` y `HAVING` (como se muestra en `demo-queries.ts`).

**Equivalente SQL (alternativa óptima):**
```sql
SELECT t.*, COUNT(ts.subject_id) as subject_count
FROM teachers t
JOIN teacher_subjects ts ON t.id = ts.teacher_id
GROUP BY t.id
HAVING COUNT(ts.subject_id) > 1;
```

---

## 4. Matrículas de un Estudiante en un Período Académico

### Ubicación del Código
- **Service:** `src/academic/enrollment/enrollment.service.ts` - Método `findByStudentAndPeriod(studentId, periodId)`
- **Controller:** `src/academic/enrollment/enrollment.controller.ts` - Endpoint `GET /academic/enrollments/student/:studentId/period/:periodId`

### Implementación
```typescript
async findByStudentAndPeriod(studentId: number, periodId: number) {
    return this.dataService.enrollment.findMany({
        where: {
            studentId,
            academicPeriodId: periodId
        },
        include: {
            student: true,
            subject: true,
            academicPeriod: true
        }
    });
}
```

### Explicación

**¿Qué hace?**
Recupera todas las matrículas (`Enrollment`) de un estudiante específico durante un período académico determinado, incluyendo los detalles del estudiante, la materia y el período.

**Métodos ORM utilizados:**
- **`findMany()`**: Busca múltiples registros de matrícula.
- **`where`**: Filtra por dos condiciones simultáneas:
  - `studentId`: ID del estudiante.
  - `academicPeriodId`: ID del período académico.
- **`include`**: Carga las relaciones completas de:
  - `student`: Datos del estudiante.
  - `subject`: Datos de la materia matriculada.
  - `academicPeriod`: Datos del período académico.

**Equivalente SQL:**
```sql
SELECT e.*, s.*, subj.*, ap.*
FROM enrollments e
INNER JOIN students s ON e.student_id = s.id
INNER JOIN subjects subj ON e.subject_id = subj.id
INNER JOIN academic_periods ap ON e.academic_period_id = ap.id
WHERE e.student_id = ? AND e.academic_period_id = ?;
```

**Caso de uso:**
Mostrar el historial de materias cursadas por un estudiante en un semestre/cuatrimestre específico.

---

## Resumen de Métodos ORM Utilizados

| Método | Descripción |
|--------|-------------|
| `findMany()` | Recupera múltiples registros que cumplan con los criterios |
| `findUnique()` | Busca un único registro por clave primaria o campo unique |
| `findFirst()` | Devuelve el primer registro que coincida con los filtros |
| `where` | Especifica condiciones de filtrado (AND implícito entre campos) |
| `include` | Carga relaciones (eager loading) mediante JOINs |
| `select` | Especifica qué campos devolver (proyección) |
| `orderBy` | Define el ordenamiento de los resultados |
| `take` | Limita el número de registros devueltos (LIMIT) |
| `_count` | Cuenta registros en relaciones sin cargarlos completamente |

---

## Comandos de Prueba (PowerShell)

Asegúrate de que el servidor esté corriendo (`npm run start:dev`) en `http://localhost:3000`:

```powershell
# 1. Estudiantes activos con carrera
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/students/status/active"

# 2. Materias de la carrera con ID 1
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/subjects/career/1"

# 3. Docentes con múltiples asignaturas
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/teachers/status/multi-subject"

# 4. Matrículas del estudiante 1 en el período 1
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/enrollments/student/1/period/1"
```
