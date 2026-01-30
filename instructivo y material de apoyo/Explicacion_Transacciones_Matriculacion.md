# Explicación de Transacciones en Matriculación - Parte 4

Este documento explica la **transacción implementada** para el proceso de matriculación de estudiantes, garantizando los principios ACID.

---

## ¿Qué es una Transacción?

Una **transacción** es un conjunto de operaciones de base de datos que se ejecutan como una **unidad atómica**: o todas se completan exitosamente, o ninguna se aplica.

**Sintaxis en Prisma:**
```typescript
await prisma.$transaction(async (tx) => {
    // Operación 1
    // Operación 2
    // Operación 3
    // Si cualquiera falla, TODAS se revierten automáticamente
});
```

---

## Transacción de Matriculación Implementada

### Ubicación del Código
- **Service:** `src/academic/enrollment/enrollment.service.ts` - Método `create(createEnrollmentDto)`
- **Controller:** `src/academic/enrollment/enrollment.controller.ts` - Endpoint `POST /academic/enrollments`

### Implementación Completa

```typescript
async create(createEnrollmentDto: CreateEnrollmentDto) {
    const { studentId, subjectId, academicPeriodId } = createEnrollmentDto;

    return this.dataService.$transaction(async (tx) => {
        // PASO 1: Verificar que el estudiante exista Y esté activo
        const student = await tx.student.findUnique({ where: { id: studentId } });
        if (!student) throw new NotFoundException(`Student with ID ${studentId} not found`);
        if (!student.isActive) throw new BadRequestException(`Student with ID ${studentId} is NOT active`);

        // PASO 2: Verificar que el período académico exista y esté activo
        const period = await tx.academicPeriod.findUnique({ where: { id: academicPeriodId } });
        if (!period) throw new NotFoundException(`Academic period with ID ${academicPeriodId} not found`);
        if (!period.isActive) throw new BadRequestException(`Academic period with ID ${academicPeriodId} is not active`);

        // PASO 3: Verificar que la materia exista y tenga cupos disponibles
        const subject = await tx.subject.findUnique({ where: { id: subjectId } });
        if (!subject) throw new NotFoundException(`Subject with ID ${subjectId} not found`);
        if (subject.availableQuota <= 0) throw new BadRequestException(`No available quota for subject ${subject.name}`);

        // PASO 4: Verificar que no exista una matrícula duplicada
        const existing = await tx.enrollment.findUnique({
            where: {
                studentId_subjectId_academicPeriodId: {
                    studentId,
                    subjectId,
                    academicPeriodId,
                },
            },
        });
        if (existing) throw new ConflictException(`Student is already enrolled in this subject for this period`);

        // PASO 5: Crear el registro de matrícula
        const enrollment = await tx.enrollment.create({
            data: createEnrollmentDto,
        });

        // PASO 6: Descontar el cupo disponible de la asignatura
        await tx.subject.update({
            where: { id: subjectId },
            data: { availableQuota: { decrement: 1 } },
        });

        return enrollment;
    });
}
```

---

## Explicación Paso a Paso

### 1️⃣ Verificar Estudiante Activo
```typescript
const student = await tx.student.findUnique({ where: { id: studentId } });
if (!student) throw new NotFoundException(`Student with ID ${studentId} not found`);
if (!student.isActive) throw new BadRequestException(`Student with ID ${studentId} is NOT active`);
```
**¿Qué hace?**
- Busca el estudiante por ID.
- Si no existe, lanza excepción → **ROLLBACK automático**.
- Si existe pero está inactivo (`isActive = false`), lanza excepción → **ROLLBACK**.

**Principio ACID:** **Consistencia** - Solo estudiantes activos pueden matricularse.

---

### 2️⃣ Verificar Período Académico Activo
```typescript
const period = await tx.academicPeriod.findUnique({ where: { id: academicPeriodId } });
if (!period) throw new NotFoundException(`Academic period with ID ${academicPeriodId} not found`);
if (!period.isActive) throw new BadRequestException(`Academic period with ID ${academicPeriodId} is not active`);
```
**¿Qué hace?**
- Verifica que el período académico exista y esté activo.
- Si el período está cerrado (`isActive = false`), no permite matricularse.

**Principio ACID:** **Consistencia** - Solo se puede matricular en períodos activos.

---

### 3️⃣ Verificar Disponibilidad de Cupos
```typescript
const subject = await tx.subject.findUnique({ where: { id: subjectId } });
if (!subject) throw new NotFoundException(`Subject with ID ${subjectId} not found`);
if (subject.availableQuota <= 0) throw new BadRequestException(`No available quota for subject ${subject.name}`);
```
**¿Qué hace?**
- Consulta la materia y verifica que tenga cupos (`availableQuota > 0`).
- Si no hay cupos, lanza excepción → **ROLLBACK**.

**Principio ACID:** **Consistencia** - No se puede matricular más estudiantes de los cupos disponibles.

---

### 4️⃣ Prevenir Matrículas Duplicadas
```typescript
const existing = await tx.enrollment.findUnique({
    where: {
        studentId_subjectId_academicPeriodId: {
            studentId,
            subjectId,
            academicPeriodId,
        },
    },
});
if (existing) throw new ConflictException(`Student is already enrolled in this subject for this period`);
```
**¿Qué hace?**
- Verifica que no exista una matrícula previa del mismo estudiante en la misma materia y período.
- Usa una **constraint única** de la base de datos (define unicidad en el schema Prisma).

**Principio ACID:** **Consistencia** - `Un estudiante no puede matricularse dos veces en la misma materia en el mismo período.

---

### 5️⃣ Registrar la Matrícula
```typescript
const enrollment = await tx.enrollment.create({
    data: createEnrollmentDto,
});
```
**¿Qué hace?**
- Inserta un nuevo registro en la tabla `enrollments`.
- Si falla por cualquier razón (ej. constraint de FK), toda la transacción se revierte.

**Principio ACID:** **Atomicidad** - Forma parte de la operación atómica.

---

### 6️⃣ Descontar el Cupo
```typescript
await tx.subject.update({
    where: { id: subjectId },
    data: { availableQuota: { decrement: 1 } },
});
```
**¿Qué hace?**
- Reduce el contador de cupos disponibles en 1.
- **`decrement: 1`** es equivalente a `availableQuota = availableQuota - 1`.

**Principio ACID:** **Atomicidad** - Si este paso falla, la matrícula también se revierte.

---

## Principios ACID Aplicados

### ⚛️ Atomicidad (Todo o Nada)
Si **cualquiera** de los 6 pasos falla:
- ❌ No se crea la matrícula.
- ❌ No se descuenta el cupo.
- ✅ La base de datos permanece en el estado anterior (ROLLBACK automático).

**Ejemplo de fallo:**
```
1. ✅ Estudiante activo
2. ✅ Período activo
3. ✅ Cupos disponibles
4. ✅ No duplicado
5. ✅ Matrícula creada
6. ❌ Falla al descontar cupo (error de red)
→ RESULTADO: Se revierte TODO, incluyendo el paso 5.
```

### 🔒 Consistencia
Las reglas de negocio se validan antes de modificar datos:
- Estudiante debe estar activo.
- Período debe estar activo.
- Debe haber cupos disponibles.
- No puede haber matrículas duplicadas.

### 🔐 Aislamiento (Concurrencia)
Si dos estudiantes intentan matricularse en la misma materia **al mismo tiempo**:
- Prisma/PostgreSQL maneja bloqueos (`locks`) automáticamente.
- Solo uno de los dos podrá matricularse si queda 1 cupo.
- El segundo recibirá error de "No disponible quota".

**Demostración técnica (opcional):**
PostgreSQL usa **READ COMMITTED** por defecto. Para mayor seguridad en concurrencia alta, se podría usar `SELECT ... FOR UPDATE` (bloqueo pesimista).

### 💾 Durabilidad
Una vez que la transacción se confirma (`COMMIT`):
- Los cambios persisten permanentemente en disco.
- Incluso si el servidor se apaga inmediatamente después, la matrícula existe.

---

## Comando PowerShell para Ejecutar

```powershell
$body = @{
    studentId = 1
    subjectId = 1
    academicPeriodId = 1
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://localhost:3000/academic/enrollments" -Body $body -ContentType "application/json"
```

### Respuesta Exitosa (200 OK)
```json
{
  "id": 3,
  "studentId": 1,
  "subjectId": 1,
  "academicPeriodId": 1,
  "enrolledAt": "2026-01-30T13:25:00.000Z",
  "createdAt": "2026-01-30T13:25:00.000Z",
  "updatedAt": "2026-01-30T13:25:00.000Z"
}
```

### Respuesta de Error (400 Bad Request)
```json
{
  "statusCode": 400,
  "message": "No available quota for subject Programming I"
}
```

---

## Simulación de Fallo (Rollback)

### Escenario 1: Estudiante Inactivo
```powershell
# Matrícula de estudiante inactivo (ID 999 no existe o está inactivo)
$body = @{ studentId = 999; subjectId = 1; academicPeriodId = 1 } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/academic/enrollments" -Body $body -ContentType "application/json"
```
**Resultado:** Error 404 o 400 → Transacción revertida automáticamente.

### Escenario 2: Sin Cupos Disponibles
```powershell
# Verificar cupos antes
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/subjects/1"

# Intentar matricular cuando availableQuota = 0
$body = @{ studentId = 1; subjectId = 1; academicPeriodId = 1 } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/academic/enrollments" -Body $body -ContentType "application/json"
```
**Resultado:** Error 400 "No available quota" → Transacción revertida.

### Escenario 3: Matrícula Duplicada
```powershell
# Matricular dos veces al mismo estudiante
$body = @{ studentId = 1; subjectId = 1; academicPeriodId = 1 } | ConvertTo-Json

# Primera vez: OK
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/academic/enrollments" -Body $body -ContentType "application/json"

# Segunda vez: Error
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/academic/enrollments" -Body $body -ContentType "application/json"
```
**Resultado:** Error 409 "Student is already enrolled" → Segunda transacción revertida.

---

## Comparación: Con vs Sin Transacción

### ❌ SIN Transacción (Código vulnerable)
```typescript
// CÓDIGO INCORRECTO - NO hacer esto
async createBad(dto: CreateEnrollmentDto) {
    // Validaciones...
    const enrollment = await this.dataService.enrollment.create({ data: dto });
    await this.dataService.subject.update({
        where: { id: dto.subjectId },
        data: { availableQuota: { decrement: 1 } }
    });
    // ⚠️ Si esta segunda operación falla, ya se creó la matrícula pero NO se descontó el cupo
}
```
**Problema:** Inconsistencia de datos. Matrícula existe pero cupo no se descontó.

### ✅ CON Transacción (Código correcto)
```typescript
// CÓDIGO CORRECTO - implementado
async create(dto: CreateEnrollmentDto) {
    return this.dataService.$transaction(async (tx) => {
        // Todas las operaciones dentro de tx
        // Si alguna falla, TODAS se revierten
    });
}
```
**Ventaja:** Garantía de integridad de datos (ACID).

---

## Buenas Prácticas en Transacciones

1. **Usa transacciones para operaciones múltiples relacionadas:** Si modificas más de una tabla y dependen entre sí.
2. **Valida antes de escribir:** Verifica condiciones antes de hacer INSERT/UPDATE.
3. **Lanza excepciones para revertir:** Cualquier `throw` dentro de `$transaction` causa ROLLBACK.
4. **Evita transacciones largas:** No hagas operaciones lentas (llamadas HTTP, esperas) dentro de una transacción.
5. **Maneja errores apropiadamente:** Usa try/catch fuera de la transacción si necesitas logging sin afectar el flujo.

---

## Verificación de la Transacción

### Antes de la Matrícula
```powershell
# Ver cupos disponibles
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/subjects/1"
# Resultado: availableQuota = 30
```

### Crear Matrícula
```powershell
$body = @{ studentId = 1; subjectId = 1; academicPeriodId = 1 } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/academic/enrollments" -Body $body -ContentType "application/json"
```

### Después de la Matrícula
```powershell
# Verificar que el cupo se descontó
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/subjects/1"
# Resultado: availableQuota = 29 ✅

# Verificar que la matrícula existe
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/enrollments"
```

---

## Resumen

La transacción de matriculación garantiza:
- ✅ **Atomicidad:** Todo o nada (matrícula + descuento de cupo).
- ✅ **Consistencia:** Validaciones de negocio (estudiante activo, cupos disponibles).
- ✅ **Aislamiento:** Protección contra condiciones de carrera en concurrencia.
- ✅ **Durabilidad:** Los cambios persisten permanentemente.

**Comando de prueba:**
```powershell
$body = @{ studentId = 1; subjectId = 1; academicPeriodId = 1 } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/academic/enrollments" -Body $body -ContentType "application/json"
```
