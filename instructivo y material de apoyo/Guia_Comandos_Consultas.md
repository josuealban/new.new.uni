# Guía de Comandos PowerShell para Consultas - Actividad Práctica

Este documento contiene todos los comandos PowerShell para ejecutar las consultas implementadas en las Partes 1, 2 y 3 de la actividad práctica.

**Requisito previo:** Asegúrate de que tu aplicación esté corriendo en `http://localhost:3000`
```powershell
npm run start:dev
```

---

## PARTE 1: Consultas Derivadas (ORM)

### 1.1 Listar Estudiantes Activos con su Carrera
**Endpoint:** `GET /academic/students/status/active`
```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/students/status/active"
```

### 1.2 Obtener Materias de una Carrera Específica
**Endpoint:** `GET /academic/subjects/career/:careerId`
```powershell
# Materias de la carrera con ID 1
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/subjects/career/1"
```

### 1.3 Listar Docentes que Imparten Más de una Asignatura
**Endpoint:** `GET /academic/teachers/status/multi-subject`
```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/teachers/status/multi-subject"
```

### 1.4 Matrículas de un Estudiante en un Período Académico
**Endpoint:** `GET /academic/enrollments/student/:studentId/period/:periodId`
```powershell
# Matrículas del estudiante 1 en el período 1
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/enrollments/student/1/period/1"
```

---

## PARTE 2: Operaciones Lógicas (AND, OR, NOT)

### 2.1 Búsqueda Avanzada de Estudiantes (AND múltiple)
**Condiciones:** Activos AND Carrera específica AND Matriculados en período
**Endpoint:** `GET /academic/students/search/advanced?careerId=X&periodId=Y`
```powershell
# Estudiantes activos de la carrera 1, matriculados en el período 1
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/students/search/advanced?careerId=1&periodId=1"
```

### 2.2 Filtro Avanzado de Docentes (AND + OR + NOT)
**Condiciones:** Tiempo completo AND (Dicten materias OR NOT inactivos)
**Endpoint:** `GET /academic/teachers/filter/advanced`
```powershell
# Docentes de tiempo completo que dicten asignaturas o estén activos
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/teachers/filter/advanced"
```

---

## PARTE 3: Consultas Nativas (SQL)

### 3.1 Reporte de Estudiantes con Total de Materias
**Descripción:** Consulta SQL nativa con JOIN, GROUP BY y ORDER BY
**Endpoint:** `GET /academic/enrollments/report/native-stats`
```powershell
# Reporte ordenado por número de materias (descendente)
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/enrollments/report/native-stats"
```

**Campos devueltos:**
- `studentName`: Nombre completo del estudiante
- `careerName`: Nombre de la carrera
- `totalSubjects`: Total de materias matriculadas

---

## EXTRA: Script Demo Completo

Si deseas ejecutar **todas** las consultas de una vez (incluidas transacciones ACID), puedes usar el script de demostración:

```powershell
# Ejecuta demo con todas las consultas (Derivadas, Lógicas, Nativas, Transacciones, ACID)
npx ts-node src/demo-queries.ts
```

Este script incluye:
- ✅ Consultas derivadas (findMany, include, where)
- ✅ Operaciones lógicas (AND, OR, NOT)
- ✅ Consultas nativas ($queryRaw, $executeRaw)
- ✅ Transacciones ACID (con validación y rollback)
- ✅ Reporte de docentes con múltiples asignaturas

---

## PARTE 4: Transacciones ACID (Bonus)

### 4.1 Crear Matrícula con Transacción
**Descripción:** Crea una matrícula verificando cupos atómicamente
**Endpoint:** `POST /academic/enrollments`
```powershell
$body = @{
    studentId = 1
    subjectId = 1
    academicPeriodId = 1
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://localhost:3000/academic/enrollments" -Body $body -ContentType "application/json"
```

**Propiedades ACID garantizadas:**
- **Atomicidad:** Si falla alguna validación, no se crea la matrícula ni se descuenta el cupo.
- **Consistencia:** Se verifican reglas de negocio (cupos disponibles, estudiante activo).
- **Aislamiento:** Múltiples solicitudes concurrentes no causan condiciones de carrera.
- **Durabilidad:** Una vez confirmada, la matrícula persiste permanentemente.

---

## Resumen de Endpoints por Parte

| Parte | Consulta | Método | Endpoint |
|-------|----------|--------|----------|
| 1.1 | Estudiantes activos con carrera | GET | `/academic/students/status/active` |
| 1.2 | Materias por carrera | GET | `/academic/subjects/career/:careerId` |
| 1.3 | Docentes con múltiples asignaturas | GET | `/academic/teachers/status/multi-subject` |
| 1.4 | Matrículas por estudiante/período | GET | `/academic/enrollments/student/:studentId/period/:periodId` |
| 2.1 | Búsqueda avanzada estudiantes | GET | `/academic/students/search/advanced?careerId=X&periodId=Y` |
| 2.2 | Filtro avanzado docentes | GET | `/academic/teachers/filter/advanced` |
| 3.1 | Reporte nativo estudiantes | GET | `/academic/enrollments/report/native-stats` |
| 4.1 | Crear matrícula (transacción) | POST | `/academic/enrollments` |

---

## Comandos de Verificación

### Ver todos los estudiantes
```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/students"
```

### Ver todas las materias
```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/subjects"
```

### Ver todos los docentes
```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/teachers"
```

### Ver todas las matrículas
```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/enrollments"
```
