# Explicación de Operaciones Lógicas - Parte 2

Este documento explica las **2 consultas con operadores lógicos** implementadas utilizando el ORM Prisma. Las operaciones lógicas permiten combinar múltiples condiciones usando **AND**, **OR** y **NOT**.

---

## 1. Búsqueda Avanzada de Estudiantes (AND Múltiple)

### Ubicación del Código
- **Service:** `src/academic/student/student.service.ts` - Método `searchAdvanced(careerId, periodId)`
- **Controller:** `src/academic/student/student.controller.ts` - Endpoint `GET /academic/students/search/advanced`

### Implementación
```typescript
async searchAdvanced(careerId: number, periodId: number) {
    return this.dataService.student.findMany({
        where: {
            AND: [
                { isActive: true },
                { careerId: careerId },
                {
                    enrollments: {
                        some: {
                            academicPeriodId: periodId
                        }
                    }
                }
            ]
        },
        include: { career: true, enrollments: true }
    });
}
```

### Explicación

**¿Qué hace?**
Busca estudiantes que cumplan **TODAS** las siguientes condiciones simultáneamente:
1. Estén activos (`isActive = true`)
2. Pertenezcan a una carrera específica (`careerId`)
3. Tengan al menos una matrícula en el período académico seleccionado

**Operadores lógicos utilizados:**

#### `AND` (Y Lógico)
- **Sintaxis:** `AND: [ condición1, condición2, ... ]`
- **Significado:** Todas las condiciones dentro del arreglo deben cumplirse.
- **Uso aquí:** Las 3 condiciones (activo, carrera, período) deben ser verdaderas.

#### `some` (Filtro de Relaciones)
- **Sintaxis:** `relacion: { some: { condiciones } }`
- **Significado:** Al menos un registro relacionado debe cumplir la condición.
- **Uso aquí:** El estudiante debe tener **al menos una** matrícula (`enrollment`) en el período especificado.

**Equivalente SQL:**
```sql
SELECT s.*, c.*, e.*
FROM students s
INNER JOIN careers c ON s.career_id = c.id
LEFT JOIN enrollments e ON s.id = e.student_id
WHERE s.is_active = true
  AND s.career_id = ?
  AND EXISTS (
    SELECT 1 FROM enrollments e2 
    WHERE e2.student_id = s.id 
    AND e2.academic_period_id = ?
  )
GROUP BY s.id;
```

**Caso de uso:**
Listar estudiantes activos de Ingeniería de Software que estén matriculados en el semestre 2026-1.

**Comando PowerShell:**
```powershell
# Buscar estudiantes activos de la carrera 1, matriculados en el período 1
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/students/search/advanced?careerId=1&periodId=1"
```

---

## 2. Filtro Avanzado de Docentes (AND + OR + NOT)

### Ubicación del Código
- **Service:** `src/academic/teacher/teacher.service.ts` - Método `filterAdvanced()`
- **Controller:** `src/academic/teacher/teacher.controller.ts` - Endpoint `GET /academic/teachers/filter/advanced`

### Implementación
```typescript
async filterAdvanced() {
    return this.dataService.teacher.findMany({
        where: {
            AND: [
                { employmentType: 'FULL_TIME' },
                {
                    OR: [
                        { subjects: { some: {} } },
                        { isActive: { not: false } }
                    ]
                }
            ]
        },
        include: { subjects: true }
    });
}
```

### Explicación

**¿Qué hace?**
Filtra docentes que cumplan:
- **De tiempo completo** (`employmentType = 'FULL_TIME'`) **Y**
- **Al menos una** de las siguientes condiciones:
  - Dicten asignaturas (tengan registros en `teacher_subjects`) **O**
  - No estén inactivos (`isActive ≠ false`, es decir, `isActive = true`)

**Operadores lógicos utilizados:**

#### `AND` (Y Lógico - Nivel Superior)
- Combina la condición de empleo (tiempo completo) con el bloque `OR`.
- Ambas deben cumplirse.

#### `OR` (O Lógico)
- **Sintaxis:** `OR: [ condición1, condición2, ... ]`
- **Significado:** Al menos **una** de las condiciones debe ser verdadera.
- **Uso aquí:** El docente puede satisfacer el filtro si:
  - Dicta materias, **O**
  - Está activo (no inactivo)

#### `NOT` (Negación)
- **Sintaxis:** `campo: { not: valor }`
- **Significado:** El valor del campo **NO** debe ser igual al especificado.
- **Uso aquí:** `isActive: { not: false }` significa "que NO esté inactivo" → `isActive = true`.

> **Nota:** `isActive: { not: false }` es equivalente a `isActive: true`, pero demuestra el uso del operador `NOT`.

**Equivalente SQL:**
```sql
SELECT t.*, ts.*
FROM teachers t
LEFT JOIN teacher_subjects ts ON t.id = ts.teacher_id
WHERE t.employment_type = 'FULL_TIME'
  AND (
    EXISTS (SELECT 1 FROM teacher_subjects ts2 WHERE ts2.teacher_id = t.id)
    OR t.is_active != false
  );
```

**Caso de uso:**
Listar docentes de planta (tiempo completo) que estén dando clases o que estén activos (o ambos).

**Comando PowerShell:**
```powershell
# Filtrar docentes de tiempo completo que dicten materias o estén activos
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/teachers/filter/advanced"
```

---

## Resumen de Operadores Lógicos

| Operador | Sintaxis | Descripción | Ejemplo |
|----------|----------|-------------|---------|
| **AND** | `AND: [cond1, cond2]` | Todas las condiciones deben cumplirse | `{ AND: [{ isActive: true }, { careerId: 1 }] }` |
| **OR** | `OR: [cond1, cond2]` | Al menos una condición debe cumplirse | `{ OR: [{ credits: 3 }, { credits: 5 }] }` |
| **NOT** | `campo: { not: valor }` | El campo NO debe tener el valor especificado | `{ isActive: { not: false } }` |
| **some** | `relacion: { some: {} }` | Al menos un registro relacionado existe | `{ enrollments: { some: {} } }` |
| **every** | `relacion: { every: {} }` | Todos los registros relacionados cumplen | `{ subjects: { every: { credits: { gte: 3 } } } }` |
| **none** | `relacion: { none: {} }` | Ningún registro relacionado cumple | `{ enrollments: { none: { grade: { lt: 3 } } } }` |

---

## Combinaciones Avanzadas

### Ejemplo: AND dentro de OR
```typescript
where: {
    OR: [
        { 
            AND: [
                { isActive: true },
                { careerId: 1 }
            ]
        },
        { email: { contains: 'admin' } }
    ]
}
```
**Significado:** (Activo Y de la carrera 1) O (email contiene 'admin')

### Ejemplo: NOT con operadores de comparación
```typescript
where: {
    credits: { not: { in: [1, 2] } }
}
```
**Significado:** Créditos NO estén en [1, 2] → solo materias de 3+ créditos.

---

## Comandos de Prueba (PowerShell)

Asegúrate de que el servidor esté corriendo (`npm run start:dev`) en `http://localhost:3000`:

```powershell
# 1. Búsqueda avanzada de estudiantes (AND múltiple)
# Buscar estudiantes activos, de la carrera 1, matriculados en el período 1
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/students/search/advanced?careerId=1&periodId=1"

# 2. Filtro avanzado de docentes (AND + OR + NOT)
# Docentes de tiempo completo que dicten materias O estén activos
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/teachers/filter/advanced"
```

---

## Diferencias entre AND, OR y NOT

### Tabla de Verdad

| Condición A | Condición B | AND (A y B) | OR (A o B) | NOT A |
|-------------|-------------|-------------|------------|-------|
| ✅ True     | ✅ True     | ✅ True     | ✅ True    | ❌ False |
| ✅ True     | ❌ False    | ❌ False    | ✅ True    | ❌ False |
| ❌ False    | ✅ True     | ❌ False    | ✅ True    | ✅ True  |
| ❌ False    | ❌ False    | ❌ False    | ❌ False   | ✅ True  |

### Ejemplo Práctico

**Datos de entrada:**
- Docente 1: Tiempo completo, dicta 2 materias, activo
- Docente 2: Tiempo completo, NO dicta materias, activo
- Docente 3: Tiempo completo, dicta 1 materia, inactivo
- Docente 4: Medio tiempo, dicta 3 materias, activo

**Filtro:** `employmentType = 'FULL_TIME' AND (subjects.some OR isActive != false)`

**Resultados:**
- ✅ Docente 1: Tiempo completo ✅ Y (Dicta ✅ O Activo ✅) → **Incluido**
- ✅ Docente 2: Tiempo completo ✅ Y (Dicta ❌ O Activo ✅) → **Incluido** (cumple OR)
- ✅ Docente 3: Tiempo completo ✅ Y (Dicta ✅ O Activo ❌) → **Incluido** (cumple OR)
- ❌ Docente 4: Tiempo completo ❌ Y ... → **Excluido** (falla AND principal)
