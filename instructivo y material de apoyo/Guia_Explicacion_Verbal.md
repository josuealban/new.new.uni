# Guía para Explicar el Código - Presentación Oral

Esta guía te ayudará a explicar verbalmente cada parte de la implementación cuando te pregunten en clase o en una presentación.

---

## PARTE 1: Consultas Derivadas

### Cómo Explicarlo:

**"Las consultas derivadas son aquellas que construimos usando los métodos del ORM, en este caso Prisma, sin escribir SQL directamente."**

### Ejemplo de Explicación:

**Profesor pregunta:** _"¿Cómo obtuviste los estudiantes activos con su carrera?"_

**Tu respuesta:**
> "Utilicé el método `findMany()` de Prisma. Primero, apliqué un filtro con `where: { isActive: true }` para obtener solo los estudiantes activos. Luego, usé `include: { career: true }` para hacer un JOIN automático con la tabla de carreras, esto se llama 'eager loading'. Prisma genera el SQL con INNER JOIN por debajo, pero yo solo escribo código TypeScript limpio y legible."

**Código que explicas:**
```typescript
async findActiveWithCareer() {
    return this.dataService.student.findMany({
        where: { isActive: true },      // Filtro WHERE
        include: { career: true },       // JOIN con careers
    });
}
```

**Puntos clave a mencionar:**
- ✅ `findMany()` = SELECT múltiple
- ✅ `where` = condiciones de filtro (WHERE)
- ✅ `include` = carga de relaciones (JOIN)
- ✅ No escribimos SQL, el ORM lo genera automáticamente

---

## PARTE 2: Operaciones Lógicas

### Cómo Explicarlo:

**"Las operaciones lógicas me permiten combinar múltiples condiciones usando AND, OR y NOT, igual que en SQL pero con sintaxis de TypeScript."**

### Ejemplo de Explicación:

**Profesor pregunta:** _"Explica cómo filtraste los docentes de tiempo completo que dicten materias O estén activos."_

**Tu respuesta:**
> "Usé un operador `AND` en el nivel superior para asegurar que todos sean de tiempo completo. Dentro de ese AND, coloqué un bloque `OR` con dos condiciones: 'subjects: { some: {} }' que verifica si el docente tiene al menos una materia asignada, y 'isActive: { not: false }' que es equivalente a decir que esté activo. El docente debe cumplir la condición de tiempo completo Y al menos una de las dos condiciones del OR."

**Código que explicas:**
```typescript
async filterAdvanced() {
    return this.dataService.teacher.findMany({
        where: {
            AND: [
                { employmentType: 'FULL_TIME' },    // Condición principal
                {
                    OR: [                           // Al menos una de estas:
                        { subjects: { some: {} } }, // Tiene materias
                        { isActive: { not: false } }// Está activo
                    ]
                }
            ]
        }
    });
}
```

**Puntos clave a mencionar:**
- ✅ `AND: []` = todas las condiciones deben cumplirse
- ✅ `OR: []` = al menos una condición debe cumplirse
- ✅ `NOT` = negación del valor
- ✅ `some: {}` = al menos un registro relacionado existe
- ✅ Se pueden anidar operadores para lógica compleja

---

## PARTE 3: Consultas Nativas (SQL)

### Cómo Explicarlo:

**"Las consultas nativas son SQL puro que escribimos directamente usando `$queryRaw` cuando necesitamos funciones avanzadas que el ORM no soporta fácilmente, como agregaciones complejas."**

### Ejemplo de Explicación:

**Profesor pregunta:** _"¿Por qué usaste SQL nativo para el reporte de estudiantes?"_

**Tu respuesta:**
> "Necesitaba hacer un reporte con agregación (COUNT) y agrupación (GROUP BY) para contar cuántas materias tiene cada estudiante. Aunque Prisma puede hacer algunas agregaciones, para este caso específico era más eficiente y claro escribir SQL directo. Usé `$queryRaw` con template literals (backticks) que Prisma escapa automáticamente para prevenir inyección SQL. La consulta une tres tablas: students, careers y enrollments, agrupa por estudiante usando GROUP BY, y cuenta sus matrículas con COUNT()."

**Código que explicas:**
```typescript
async getNativeStudentReport() {
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
}
```

**Puntos clave a mencionar:**
- ✅ `||` = concatenación de strings en SQL
- ✅ `LEFT JOIN` = incluye estudiantes sin matrículas (0 materias)
- ✅ `COUNT()` = función de agregación
- ✅ `GROUP BY` = agrupa filas para la agregación
- ✅ `::int` = cast a entero en PostgreSQL
- ✅ Backticks (template literals) previenen inyección SQL

---

## PARTE 4: Transacciones y ACID

### Cómo Explicarlo:

**"Una transacción es un conjunto de operaciones que se ejecutan como una unidad: o todas se completan exitosamente, o ninguna se aplica. Esto garantiza los principios ACID."**

### Ejemplo de Explicación:

**Profesor pregunta:** _"Explica cómo funciona tu transacción de matriculación."_

**Tu respuesta:**
> "La transacción de matriculación tiene 6 pasos dentro de `$transaction()`. Primero, verifico que el estudiante exista y esté activo. Segundo, verifico que el período académico esté activo. Tercero, verifico que la materia tenga cupos disponibles. Cuarto, verifico que no exista una matrícula duplicada. Quinto, creo el registro de matrícula. Y sexto, descuento el cupo de la materia usando `decrement: 1`. Si cualquiera de estos pasos falla y lanza una excepción, Prisma revierte automáticamente TODA la transacción."

**Código que explicas:**
```typescript
return this.dataService.$transaction(async (tx) => {
    // 1. Verificar estudiante activo
    const student = await tx.student.findUnique({ where: { id: studentId } });
    if (!student?.isActive) throw new BadRequestException('Student not active');
    
    // 2-4. Más validaciones...
    
    // 5. Crear matrícula
    const enrollment = await tx.enrollment.create({ data: dto });
    
    // 6. Descontar cupo
    await tx.subject.update({
        where: { id: subjectId },
        data: { availableQuota: { decrement: 1 } }
    });
    
    return enrollment; // Solo si todo salió bien
});
```

**Explicación de ACID:**

**Profesor pregunta:** _"¿Cómo se aplican los principios ACID aquí?"_

**Tu respuesta:**
> "**Atomicidad:** Si el descuento de cupo falla después de crear la matrícula, se revierte TODO, no queda la matrícula sin descontar el cupo. Es todo o nada.
>
> **Consistencia:** Valido todas las reglas de negocio antes de modificar datos: estudiante activo, cupos disponibles, no duplicados. La base nunca queda en un estado inválido.
>
> **Aislamiento:** Si dos estudiantes se matriculan simultáneamente en la última plaza, Prisma maneja los bloqueos (locks) para que solo uno lo logre. No hay condiciones de carrera.
>
> **Durabilidad:** Una vez confirmada la transacción con COMMIT, la matrícula persiste permanentemente en disco, incluso si el servidor se cae un segundo después."

**Puntos clave a mencionar:**
- ✅ `$transaction()` = envoltura ACID
- ✅ Cualquier `throw` dentro causa ROLLBACK automático
- ✅ `decrement: 1` = operación atómica de base de datos
- ✅ Validaciones antes de escritura = Consistencia
- ✅ Prisma maneja locks automáticamente = Aislamiento

---

## TIPS PARA LA PRESENTACIÓN

### 1. Usa Analogías Simples

**Transacción bancaria:**
> "Es como transferir dinero entre cuentas: si el descuento de tu cuenta falla, no se debe acreditar en la otra. O se completan ambas operaciones, o ninguna."

**ORM vs SQL Nativo:**
> "El ORM es como Google Translate para bases de datos: traduce mi código TypeScript a SQL automáticamente. Pero a veces, para cosas muy específicas, es mejor escribir SQL directamente."

### 2. Explica el "Por Qué"

No solo digas **qué** hace el código, explica **por qué** lo hiciste así:

❌ **Mal:** "Usé `include: { career: true }`"

✅ **Bien:** "Usé `include: { career: true }` porque necesito mostrar el nombre de la carrera junto con cada estudiante. Esto hace un JOIN automáticamente, así evito consultas N+1 (consultar la carrera de cada estudiante por separado)."

### 3. Anticipa Preguntas Comunes

**"¿Por qué usaste LEFT JOIN en la consulta nativa?"**
> "Porque quiero incluir estudiantes que aún no tienen matrículas (freshmen). Si usara INNER JOIN, solo vería estudiantes ya matriculados."

**"¿Qué pasa si dos personas se matriculan al mismo tiempo?"**
> "PostgreSQL maneja los locks automáticamente. Cuando la primera transacción lee y decrementa el cupo, la segunda espera. Si solo queda 1 cupo, la primera lo toma y la segunda recibe un error de 'No available quota'."

**"¿Por qué no usaste SQL nativo para todo?"**
> "El ORM me da type-safety (errores en tiempo de compilación), auto-completado en el editor, y migraciones automáticas. Solo uso SQL nativo cuando necesito funciones avanzadas como window functions o agregaciones complejas."

### 4. Muestra el Resultado

Si puedes, ten lista una demostración:

```powershell
# "Aquí voy a ejecutar la consulta de estudiantes activos..."
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/students/status/active"

# "Como pueden ver, devuelve 4 estudiantes con su información de carrera incluida."
```

### 5. Sé Honesto con lo que No Sabes

Si te preguntan algo que no sabes:

✅ **Correcto:** "No estoy 100% seguro de cómo Prisma maneja los locks a nivel interno, pero sé que usa las capacidades nativas de PostgreSQL para transacciones ACID. Puedo investigarlo y responder después."

❌ **Incorrecto:** *Inventar una respuesta técnica incorrecta.*

---

## RESUMEN RÁPIDO (Para Memorizar)

### Consultas Derivadas
- **Qué:** Métodos del ORM (findMany, include, where)
- **Cuándo:** Consultas estándar con relaciones
- **Ventaja:** Code-first, type-safe, legible

### Operaciones Lógicas
- **Qué:** AND, OR, NOT para condiciones complejas
- **Cuándo:** Filtros que combinan múltiples criterios
- **Ventaja:** Expresividad sin SQL directo

### Consultas Nativas
- **Qué:** SQL directo con $queryRaw
- **Cuándo:** Agregaciones complejas, reportes, performance
- **Ventaja:** Acceso a todas las funciones de PostgreSQL

### Transacciones
- **Qué:** $transaction() para operaciones atómicas
- **Cuándo:** Múltiples escrituras interdependientes
- **Ventaja:** Garantía ACID (integridad de datos)

---

## FRASE FINAL PARA CERRAR TU PRESENTACIÓN

> "En resumen, combiné consultas derivadas para operaciones cotidianas, operadores lógicos para filtros avanzados, SQL nativo para reportes optimizados, y transacciones para garantizar la integridad de datos en operaciones críticas como la matriculación. Esta arquitectura asegura un sistema robusto, mantenible y escalable para la gestión académica universitaria."

🎤 **¡Buena suerte en tu presentación!**
