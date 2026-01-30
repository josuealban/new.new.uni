# Explicación de Consultas Nativas (SQL) - Parte 3

Este documento explica la **consulta SQL nativa** implementada para generar reportes complejos que requieren operaciones avanzadas de base de datos.

---

## ¿Qué es una Consulta Nativa?

Una **consulta nativa** es SQL escrito directamente (SELECT, INSERT, UPDATE, DELETE) en lugar de usar los métodos del ORM. Se utiliza cuando:

- Se necesitan funciones SQL avanzadas (agregaciones, subconsultas complejas)
- Se requiere optimización de rendimiento
- El ORM no soporta la operación deseada nativamente

### Métodos de Prisma para SQL Nativo

| Método | Uso | Retorno |
|--------|-----|---------|
| `$queryRaw` | Consultas de **lectura** (SELECT) | Arreglo de objetos con los datos |
| `$executeRaw` | Consultas de **escritura** (INSERT, UPDATE, DELETE) | Número de filas afectadas |

---

## Reporte de Estudiantes con Total de Materias

### Ubicación del Código
- **Service:** `src/academic/enrollment/enrollment.service.ts` - Método `getNativeStudentReport()`
- **Controller:** `src/academic/enrollment/enrollment.controller.ts` - Endpoint `GET /academic/enrollments/report/native-stats`

### Implementación

```typescript
async getNativeStudentReport() {
    try {
        return await this.dataService.$queryRaw`
            SELECT 
                s.first_name || ' ' || s.last_name as "studentName",
                c.name as "careerName",
                COUNT(e.id)::int as "totalSubjects"
            FROM students s
            JOIN careers c ON s.career_id = c.id
            LEFT JOIN enrollments e ON s.id = e.student_id
            GROUP BY s.id, s.first_name, s.last_name, c.name
            ORDER BY "totalSubjects" DESC
        `;
    } catch (error) {
        console.error('Error in native report:', error);
        throw error;
    }
}
```

---

## Explicación Detallada de la Consulta SQL

### 1. SELECT - Columnas a Recuperar

```sql
SELECT 
    s.first_name || ' ' || s.last_name as "studentName",
    c.name as "careerName",
    COUNT(e.id)::int as "totalSubjects"
```

**Operaciones:**

#### Concatenación (`||`)
- **Sintaxis:** `'texto1' || ' ' || 'texto2'`
- **Uso aquí:** `s.first_name || ' ' || s.last_name` combina nombre y apellido con un espacio en medio.
- **Ejemplo:** `'Josue' || ' ' || 'Alban'` → `'Josue Alban'`

#### Alias (`as "nombreColumna"`)
- **Sintaxis:** `expresion as "alias"`
- **Uso aquí:** Renombra las columnas para que tengan nombres más descriptivos en el resultado.
- **Nota:** Las comillas dobles preservan mayúsculas/minúsculas en PostgreSQL.

#### Función de Agregación (`COUNT()`)
- **Sintaxis:** `COUNT(columna)`
- **Uso aquí:** Cuenta cuántas matrículas (`enrollments`) tiene cada estudiante.
- **`::int`:** Convierte explícitamente el resultado a entero (cast de tipo en PostgreSQL).

---

### 2. FROM y JOIN - Unión de Tablas

```sql
FROM students s
JOIN careers c ON s.career_id = c.id
LEFT JOIN enrollments e ON s.id = e.student_id
```

**Tipos de JOIN utilizados:**

#### INNER JOIN (JOIN)
- **Sintaxis:** `tabla1 JOIN tabla2 ON condicion`
- **Comportamiento:** Solo incluye filas donde **ambas** tablas tienen coincidencia.
- **Uso aquí:** `JOIN careers c ON s.career_id = c.id`
  - Solo incluye estudiantes que tienen una carrera asignada.

#### LEFT JOIN
- **Sintaxis:** `tabla1 LEFT JOIN tabla2 ON condicion`
- **Comportamiento:** Incluye **todas** las filas de la tabla izquierda, incluso si no hay coincidencia en la derecha.
- **Uso aquí:** `LEFT JOIN enrollments e ON s.id = e.student_id`
  - Incluye estudiantes **sin matrículas** (totalSubjects = 0).
  - Si usáramos INNER JOIN, solo aparecerían estudiantes con al menos una matrícula.

**Diagrama de las relaciones:**
```
students (s) ─── JOIN ───> careers (c)
    │
    └─── LEFT JOIN ───> enrollments (e)
```

---

### 3. GROUP BY - Agrupación

```sql
GROUP BY s.id, s.first_name, s.last_name, c.name
```

**¿Por qué GROUP BY?**
- Permite usar funciones de agregación como `COUNT()`.
- Agrupa las filas por estudiante único.

**Regla de SQL:**
- Todas las columnas en el `SELECT` que **NO** sean agregadas (`COUNT`, `SUM`, etc.) deben aparecer en el `GROUP BY`.

**Ejemplo de agrupación:**

| student_id | first_name | enrollments.id |
|------------|------------|----------------|
| 1          | Josue      | 101            |
| 1          | Josue      | 102            |
| 2          | Maria      | 201            |

**Después del GROUP BY:**

| student_id | first_name | COUNT(enrollments.id) |
|------------|------------|-----------------------|
| 1          | Josue      | 2                     |
| 2          | Maria      | 1                     |

---

### 4. ORDER BY - Ordenamiento

```sql
ORDER BY "totalSubjects" DESC
```

**Parámetros:**
- **`"totalSubjects"`**: Nombre de la columna (alias definido en SELECT).
- **`DESC`**: Orden descendente (mayor a menor).
- **Alternativa:** `ASC` para ascendente (menor a mayor).

**Resultado:**
Los estudiantes con más materias matriculadas aparecen primero.

---

## Ventajas y Desventajas de Consultas Nativas

### ✅ Ventajas

1. **Rendimiento optimizado:** SQL puede ser más eficiente que múltiples queries del ORM.
2. **Funcionalidades avanzadas:** Acceso a todas las características de PostgreSQL (window functions, CTEs, etc.).
3. **Reportes complejos:** Ideal para análisis de datos con agregaciones múltiples.

### ⚠️ Desventajas

1. **Dependencia de la base de datos:** El SQL específico de PostgreSQL no funcionará en MySQL/SQLite sin cambios.
2. **Sin validación de tipos en tiempo de compilación:** Errores solo aparecen en ejecución.
3. **Seguridad:** Riesgo de inyección SQL si no se usa correctamente (Prisma previene esto con tagged templates).

---

## Seguridad: Prevención de Inyección SQL

### ❌ INCORRECTO (Vulnerable)
```typescript
// NUNCA hagas esto
const studentId = req.query.id;
await prisma.$queryRaw(`SELECT * FROM students WHERE id = ${studentId}`);
```

### ✅ CORRECTO (Seguro)
```typescript
// Usa tagged template literals (backticks)
const studentId = req.query.id;
await prisma.$queryRaw`SELECT * FROM students WHERE id = ${studentId}`;
```

**¿Por qué es seguro?**
Prisma automáticamente **escapa y sanitiza** los valores interpolados (`${studentId}`), previniendo inyección SQL.

---

## Alternativa con ORM (Comparación)

La misma consulta podría aproximarse con métodos del ORM así:

```typescript
// Aproximación (no exacta porque Prisma no soporta COUNT en relaciones fácilmente)
const students = await this.dataService.student.findMany({
    include: {
        career: true,
        _count: { select: { enrollments: true } }
    },
    orderBy: { enrollments: { _count: 'desc' } } // No soportado en Prisma estándar
});

// Luego formatear en JavaScript
return students.map(s => ({
    studentName: `${s.firstName} ${s.lastName}`,
    careerName: s.career.name,
    totalSubjects: s._count.enrollments
}));
```

**Problemas de esta alternativa:**
- No permite ordenar directamente por el conteo de relaciones en Prisma.
- Requiere procesamiento adicional en JavaScript.
- Menos eficiente para grandes volúmenes de datos.

**Por eso se usa SQL nativo para este caso.**

---

## Comando PowerShell para Ejecutar la Consulta

Asegúrate de que el servidor esté corriendo (`npm run start:dev`) en `http://localhost:3000`:

```powershell
# Obtener reporte de estudiantes con total de materias matriculadas
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/enrollments/report/native-stats"
```

### Ejemplo de Respuesta

```json
[
  {
    "studentName": "Josue Alban",
    "careerName": "Software Engineering",
    "totalSubjects": 1
  },
  {
    "studentName": "Estudiante Tx",
    "careerName": "Software Engineering",
    "totalSubjects": 1
  }
]
```

---

## Otros Ejemplos de Consultas Nativas

### 1. Consulta de Escritura (`$executeRaw`)

```typescript
// Actualizar cupos masivamente
const rowsAffected = await this.dataService.$executeRaw`
    UPDATE subjects
    SET available_quota = max_quota
    WHERE available_quota > max_quota
`;
console.log(`Filas actualizadas: ${rowsAffected}`);
```

### 2. Subconsulta con WHERE IN

```typescript
const topStudents = await this.dataService.$queryRaw`
    SELECT * FROM students
    WHERE id IN (
        SELECT student_id 
        FROM enrollments 
        GROUP BY student_id 
        HAVING COUNT(*) >= 5
    )
`;
```

### 3. Window Functions (Ranking)

```typescript
const rankedSubjects = await this.dataService.$queryRaw`
    SELECT 
        name,
        credits,
        RANK() OVER (ORDER BY credits DESC) as rank
    FROM subjects
`;
```

---

## Buenas Prácticas

1. **Usa `$queryRaw` solo cuando sea necesario:** Prefiere el ORM cuando sea posible para mantener portabilidad.
2. **Siempre usa tagged templates (backticks):** Previene inyección SQL.
3. **Maneja errores adecuadamente:** Envuelve en `try/catch` y registra errores.
4. **Documenta consultas complejas:** Añade comentarios explicando qué hace cada parte.
5. **Prueba con datos reales:** Verifica que las consultas funcionan con el volumen esperado de datos.
