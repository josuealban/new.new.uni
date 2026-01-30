# Referencia Rápida: Ubicación del Código de las Consultas

Esta guía te indica **exactamente dónde mostrar** el código de cada consulta cuando el ingeniero te lo pida.

---

## PARTE 1: Consultas Derivadas

### 1.1 Estudiantes Activos con su Carrera

**Service:** `src/academic/student/student.service.ts` - **Líneas 116-121**
```typescript
async findActiveWithCareer() {
    return this.dataService.student.findMany({
        where: { isActive: true },
        include: { career: true },
    });
}
```

**Controller:** `src/academic/student/student.controller.ts` - **Líneas 24-28**
```typescript
@Get('status/active')
@ApiOperation({ summary: 'List all active students with their career (Parte 1)' })
findActive() {
    return this.studentService.findActiveWithCareer();
}
```

---

### 1.2 Materias por Carrera

**Service:** `src/academic/subject/subject.service.ts` - **Líneas 136-141**
```typescript
async findByCareer(careerId: number) {
    return this.dataService.subject.findMany({
        where: { careerId },
        include: { career: true },
    });
}
```

**Controller:** `src/academic/subject/subject.controller.ts` - **Líneas 24-28**
```typescript
@Get('career/:careerId')
@ApiOperation({ summary: 'List subjects by career (Parte 1)' })
findByCareer(@Param('careerId', ParseIntPipe) careerId: number) {
    return this.subjectService.findByCareer(careerId);
}
```

---

### 1.3 Docentes con Múltiples Asignaturas

**Service:** `src/academic/teacher/teacher.service.ts` - **Líneas 101-110**
```typescript
async findMultiSubjectTeachers() {
    const teachers = await this.dataService.teacher.findMany({
        include: { _count: { select: { subjects: true } } }
    });
    return teachers.filter(t => t._count.subjects > 1);
}
```

**Controller:** `src/academic/teacher/teacher.controller.ts` - **Líneas 32-35**
```typescript
@Get('status/multi-subject')
findMultiSubject() {
    return this.teacherService.findMultiSubjectTeachers();
}
```

---

### 1.4 Matrículas por Estudiante y Período

**Service:** `src/academic/enrollment/enrollment.service.ts` - **Líneas 144-156**
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

**Controller:** `src/academic/enrollment/enrollment.controller.ts` - **Líneas 30-37**
```typescript
@Get('student/:studentId/period/:periodId')
@ApiOperation({ summary: 'List enrollments for a student in a specific period (Parte 1)' })
findByStudentAndPeriod(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Param('periodId', ParseIntPipe) periodId: number,
) {
    return this.enrollmentService.findByStudentAndPeriod(studentId, periodId);
}
```

---

## PARTE 2: Operaciones Lógicas

### 2.1 Búsqueda Avanzada de Estudiantes (AND)

**Service:** `src/academic/student/student.service.ts` - **Líneas 124-141**
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

**Controller:** `src/academic/student/student.controller.ts` - **Líneas 30-37**
```typescript
@Get('search/advanced')
@ApiOperation({ summary: 'Search students with logical operators (Parte 2)' })
searchAdvanced(
    @Query('careerId', ParseIntPipe) careerId: number,
    @Query('periodId', ParseIntPipe) periodId: number,
) {
    return this.studentService.searchAdvanced(careerId, periodId);
}
```

---

### 2.2 Filtro Avanzado de Docentes (AND + OR + NOT)

**Service:** `src/academic/teacher/teacher.service.ts` - **Líneas 113-128**
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

**Controller:** `src/academic/teacher/teacher.controller.ts` - **Líneas 37-40**
```typescript
@Get('filter/advanced')
filterAdvanced() {
    return this.teacherService.filterAdvanced();
}
```

---

## PARTE 3: Consultas Nativas

### 3.1 Reporte de Estudiantes con Total de Materias

**Service:** `src/academic/enrollment/enrollment.service.ts` - **Líneas 159-176**
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

**Controller:** `src/academic/enrollment/enrollment.controller.ts` - **Líneas 24-28**
```typescript
@Get('report/native-stats')
@ApiOperation({ summary: 'Get native SQL report of enrollments per student (Parte 3)' })
getReport() {
    return this.enrollmentService.getNativeStudentReport();
}
```

---

## PARTE 4: Transacciones

### 4.1 Transacción de Matriculación

**Service:** `src/academic/enrollment/enrollment.service.ts` - **Líneas 11-54**
```typescript
async create(createEnrollmentDto: CreateEnrollmentDto) {
    const { studentId, subjectId, academicPeriodId } = createEnrollmentDto;

    return this.dataService.$transaction(async (tx) => {
        // 1. Verify student exists AND is active
        const student = await tx.student.findUnique({ where: { id: studentId } });
        if (!student) throw new NotFoundException(`Student with ID ${studentId} not found`);
        if (!student.isActive) throw new BadRequestException(`Student with ID ${studentId} is NOT active`);

        // 2. Verify academic period exists and is active
        const period = await tx.academicPeriod.findUnique({ where: { id: academicPeriodId } });
        if (!period) throw new NotFoundException(`Academic period with ID ${academicPeriodId} not found`);
        if (!period.isActive) throw new BadRequestException(`Academic period with ID ${academicPeriodId} is not active`);

        // 3. Verify subject exists and has quota
        const subject = await tx.subject.findUnique({ where: { id: subjectId } });
        if (!subject) throw new NotFoundException(`Subject with ID ${subjectId} not found`);
        if (subject.availableQuota <= 0) throw new BadRequestException(`No available quota for subject ${subject.name}`);

        // 4. Verify no duplicate enrollment
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

        // 5. Create enrollment and update quota
        const enrollment = await tx.enrollment.create({
            data: createEnrollmentDto,
        });

        await tx.subject.update({
            where: { id: subjectId },
            data: { availableQuota: { decrement: 1 } },
        });

        return enrollment;
    });
}
```

**Controller:** `src/academic/enrollment/enrollment.controller.ts` - **Líneas 12-16**
```typescript
@Post()
@ApiOperation({ summary: 'Create a new enrollment' })
create(@Body() createEnrollmentDto: CreateEnrollmentDto) {
    return this.enrollmentService.create(createEnrollmentDto);
}
```

---

## Script de Demostración Completo

**Archivo:** `src/demo-queries.ts`

Este archivo contiene ejemplos ejecutables de:
- Consultas derivadas (líneas 18-43)
- Operaciones lógicas (líneas 46-68)
- Consultas nativas (líneas 71-89)
- Transacciones ACID (líneas 92-153)
- Extra: Docentes con múltiples asignaturas (líneas 157-179)

**Ejecutar:**
```powershell
npx ts-node src/demo-queries.ts
```

---

## Resumen Visual

```
📁 src/academic/
├── 📁 student/
│   ├── student.service.ts
│   │   ├── findActiveWithCareer() → Parte 1.1
│   │   └── searchAdvanced() → Parte 2.1
│   └── student.controller.ts
│
├── 📁 subject/
│   ├── subject.service.ts
│   │   └── findByCareer() → Parte 1.2
│   └── subject.controller.ts
│
├── 📁 teacher/
│   ├── teacher.service.ts
│   │   ├── findMultiSubjectTeachers() → Parte 1.3
│   │   └── filterAdvanced() → Parte 2.2
│   └── teacher.controller.ts
│
└── 📁 enrollment/
    ├── enrollment.service.ts
    │   ├── findByStudentAndPeriod() → Parte 1.4
    │   ├── getNativeStudentReport() → Parte 3.1
    │   └── create() → Parte 4.1 (Transacción)
    └── enrollment.controller.ts

📄 src/demo-queries.ts → Script completo de demostración
```

---

## Tips para Mostrar el Código

### Opción 1: Abrir Visual Studio Code
1. Abre VSCode en la carpeta del proyecto
2. Navega al archivo específico (ej. `student.service.ts`)
3. Busca el método (Ctrl+F, busca el nombre del método)
4. Muestra las líneas indicadas

### Opción 2: Usar GitHub/GitLab
Si tu código está en un repositorio:
1. Abre el archivo en la web
2. Haz clic en el número de línea para resaltar
3. Comparte el link directo

### Opción 3: Imprimir Fragmentos
Para una presentación, puedes imprimir los fragmentos de código de los documentos de explicación ya creados.

---

## Comando Rápido para Ver Archivos

```powershell
# Ver un archivo específico desde PowerShell
code src/academic/student/student.service.ts

# Ver múltiples archivos
code src/academic/student/student.service.ts src/academic/student/student.controller.ts
```
