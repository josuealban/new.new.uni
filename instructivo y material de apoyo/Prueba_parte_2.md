# Documento de Evaluación: Prueba Parte 2

Este documento contiene el desarrollo completo de la **Actividad Práctica – CLASE 3 (NestJS)**, cubriendo consultas avanzadas, lógica, transacciones y análisis ACID.

---

## 🏗️ Parte 1: Consultas Derivadas (ORM)
Implementación de consultas utilizando los métodos nativos de Prisma.

### 1.1 Listar Estudiantes Activos con su Carrera
- **Ruta:** `GET /academic/students/status/active`
- **Comando:** `Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/students/status/active"`
- **Código:** Usa `findMany({ where: { isActive: true }, include: { career: true } })`.

### 1.2 Materias asociadas a una Carrera (ID 1)
- **Ruta:** `GET /academic/subjects/career/1`
- **Comando:** `Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/subjects/career/1"`
- **Código:** `subject.findMany({ where: { careerId: 1 } })`.

### 1.3 Docentes con más de una Asignatura
- **Ruta:** `GET /academic/teachers/status/multi-subject`
- **Comando:** `Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/teachers/status/multi-subject"`
- **Código:** Utiliza `findMany` con un filtro `subjects: { some: {} }` y lógica de conteo en el servicio.

### 1.4 Matrículas de un estudiante en un período (Estudiante 1, Período 1)
- **Ruta:** `GET /academic/enrollments/student/1/period/1`
- **Comando:** `Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/enrollments/student/1/period/1"`

---

## 🧠 Parte 2: Operaciones Lógicas
Filtros dinámicos utilizando operadores `AND`, `OR` y `NOT`.

### 2.1 Búsqueda Avanzada de Estudiantes (AND)
- **Criterio:** Activos AND Carrera 1 AND Período 1.
- **Comando:** `Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/students/search/advanced?careerId=1&periodId=1"`

### 2.2 Filtro de Docentes (AND, OR, NOT)
- **Criterio:** FullTime AND (Con materias OR NOT Inactivo).
- **Comando:** `Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/teachers/filter/advanced"`

---

## 📊 Parte 3: Consulta Nativa (SQL Puro)
Generación de reportes complejos mediante `$queryRaw`.

### 3.1 Reporte de Materias por Estudiante
- **Comando:** `Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/enrollments/report/native-stats"`
- **SQL Ejecutado:**
```sql
SELECT s.first_name || ' ' || s.last_name as "studentName", c.name as "careerName", COUNT(e.id)::int as "totalSubjects"
FROM students s
JOIN careers c ON s.career_id = c.id
LEFT JOIN enrollments e ON s.id = e.student_id
GROUP BY s.id, s.first_name, s.last_name, c.name
ORDER BY "totalSubjects" DESC
```

---

## 🛡️ Parte 4: Operación Transaccional
Proceso de matriculación garantizando integridad mediante `$transaction`.

### 4.1 Flujo de Matriculación
1. **Validar Estudiante:** Verifica que exista y esté `isActive: true`.
2. **Validar Cupos:** Verifica que `availableQuota > 0`.
3. **Registrar:** Crea el registro en la tabla `enrollments`.
4. **Actualizar:** Realiza un `decrement` de 1 en los cupos de la materia.

- **Comando de prueba:**
```powershell
$body = @{ studentId = 1; subjectId = 3; academicPeriodId = 1 } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/academic/enrollments" -Body $body -ContentType "application/json"
```

---

## 💎 Parte 5: Principios ACID (Análisis)

### 1. Atomicidad (All or Nothing)
En el proceso de matriculación (Sección 4), la atomicidad garantiza que si el sistema falla al intentar descontar el cupo de la materia, la matrícula del estudiante **no se guarda**. No pueden quedar datos "a medias".

### 2. Consistencia (Rules enforcement)
La base de datos siempre pasa de un estado válido a otro. Las restricciones `@unique` en el esquema impiden que un alumno se matricule dos veces en la misma materia, y las validaciones de código impiden matricular a alumnos inactivos.

### 3. Aislamiento (Concurrency Control)
Gracias a PostgreSQL y las transacciones de Prisma, si dos alumnos intentan tomar el **último cupo** al mismo tiempo, el sistema los procesará de forma aislada. Uno obtendrá el cupo y el segundo recibirá un error de "Sin cupo disponible", evitando sobreventas.

### 4. Durabilidad (Permanent commitment)
Una vez que el servidor devuelve un `201 Created`, la información ha sido confirmada en el almacenamiento físico (disco). Aunque el servidor se reinicie inmediatamente después, los datos persistirán.

---

## 🏁 Criterios de Evaluación Cumplidos
- [x] Consultas Derivadas (25%)
- [x] Operadores Lógicos (20%)
- [x] Consulta Nativa SQL (20%)
- [x] Transacciones NestJS (25%)
- [x] Análisis ACID (10%)
