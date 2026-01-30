# Guía Rápida: Cómo Encontrar Cualquier Endpoint

Este documento te enseña a rastrear **cualquier petición HTTP** desde la URL hasta el código.

---

## Método Rápido: De URL a Código

### Regla General

```
URL: http://localhost:3000/academic/RECURSO
     ↓
Controller: src/academic/RECURSO/RECURSO.controller.ts
     ↓
Service: src/academic/RECURSO/RECURSO.service.ts
```

---

## Ejemplo 1: GET /academic/careers

### Paso 1: Identificar el recurso
**URL:** `http://localhost:3000/academic/careers`
**Recurso:** `careers`

### Paso 2: Ir al controller
**Archivo:** `src/academic/career/career.controller.ts`

```typescript
@Controller('academic/careers')  // ← Define la ruta base
export class CareerController {
    
    @Get()                       // ← GET /academic/careers
    findAll() {
        return this.careerService.findAll();
    }
    
    @Get(':id')                  // ← GET /academic/careers/:id
    findOne(@Param('id') id: number) {
        return this.careerService.findOne(id);
    }
    
    @Post()                      // ← POST /academic/careers
    create(@Body() dto: CreateCareerDto) {
        return this.careerService.create(dto);
    }
}
```

### Paso 3: Ver el service
**Archivo:** `src/academic/career/career.service.ts`

```typescript
async findAll() {
    return this.dataService.career.findMany({
        include: { specialty: true, subjects: true },
    });
}
```

---

## Ejemplo 2: GET /academic/students/status/active

### Paso 1: Analizar la URL
**URL:** `http://localhost:3000/academic/students/status/active`
**Recurso:** `students`
**Subruta:** `status/active`

### Paso 2: Ir al controller
**Archivo:** `src/academic/student/student.controller.ts`

```typescript
@Controller('academic/students')
export class StudentController {
    
    @Get('status/active')  // ← Subruta adicional
    findActive() {
        return this.studentService.findActiveWithCareer();
    }
}
```

### Paso 3: Ver el service
**Archivo:** `src/academic/student/student.service.ts`

```typescript
async findActiveWithCareer() {
    return this.dataService.student.findMany({
        where: { isActive: true },
        include: { career: true },
    });
}
```

---

## Ejemplo 3: GET /academic/subjects/career/:careerId

### Paso 1: Identificar parámetros
**URL:** `http://localhost:3000/academic/subjects/career/1`
**Recurso:** `subjects`
**Parámetro:** `careerId = 1`

### Paso 2: Controller con parámetro
**Archivo:** `src/academic/subject/subject.controller.ts`

```typescript
@Get('career/:careerId')
findByCareer(@Param('careerId', ParseIntPipe) careerId: number) {
    return this.subjectService.findByCareer(careerId);
}
```

### Paso 3: Service usando el parámetro
**Archivo:** `src/academic/subject/subject.service.ts`

```typescript
async findByCareer(careerId: number) {
    return this.dataService.subject.findMany({
        where: { careerId },
        include: { career: true },
    });
}
```

---

## Ejemplo 4: POST /academic/enrollments

### Paso 1: Método POST
**URL:** `http://localhost:3000/academic/enrollments`
**Método:** `POST`
**Body:** JSON con datos

### Paso 2: Controller maneja POST
**Archivo:** `src/academic/enrollment/enrollment.controller.ts`

```typescript
@Post()
create(@Body() createEnrollmentDto: CreateEnrollmentDto) {
    return this.enrollmentService.create(createEnrollmentDto);
}
```

### Paso 3: Service con transacción
**Archivo:** `src/academic/enrollment/enrollment.service.ts`

```typescript
async create(createEnrollmentDto: CreateEnrollmentDto) {
    return this.dataService.$transaction(async (tx) => {
        // Validaciones y creación
    });
}
```

---

## Tabla de Referencia Rápida

| URL | Recurso | Controller | Service | Método |
|-----|---------|------------|---------|--------|
| `GET /academic/careers` | careers | `career.controller.ts` (L18) | `career.service.ts` (L32) | `findAll()` |
| `GET /academic/students/status/active` | students | `student.controller.ts` (L24) | `student.service.ts` (L116) | `findActiveWithCareer()` |
| `GET /academic/subjects/career/:id` | subjects | `subject.controller.ts` (L24) | `subject.service.ts` (L136) | `findByCareer()` |
| `GET /academic/teachers/status/multi-subject` | teachers | `teacher.controller.ts` (L32) | `teacher.service.ts` (L101) | `findMultiSubjectTeachers()` |
| `GET /academic/enrollments/student/:sid/period/:pid` | enrollments | `enrollment.controller.ts` (L30) | `enrollment.service.ts` (L144) | `findByStudentAndPeriod()` |
| `POST /academic/enrollments` | enrollments | `enrollment.controller.ts` (L12) | `enrollment.service.ts` (L11) | `create()` |

---

## Estructura de Carpetas

```
src/academic/
├── career/
│   ├── career.controller.ts    ← Endpoints de /academic/careers
│   ├── career.service.ts       ← Lógica de carreras
│   └── dto/
│       ├── create-career.dto.ts
│       └── update-career.dto.ts
│
├── student/
│   ├── student.controller.ts   ← Endpoints de /academic/students
│   ├── student.service.ts      ← Lógica de estudiantes
│   └── dto/
│
├── subject/
│   ├── subject.controller.ts   ← Endpoints de /academic/subjects
│   ├── subject.service.ts      ← Lógica de materias
│   └── dto/
│
├── teacher/
│   ├── teacher.controller.ts   ← Endpoints de /academic/teachers
│   ├── teacher.service.ts      ← Lógica de docentes
│   └── dto/
│
└── enrollment/
    ├── enrollment.controller.ts ← Endpoints de /academic/enrollments
    ├── enrollment.service.ts    ← Lógica de matrículas
    └── dto/
```

---

## Decoradores de Rutas en NestJS

### En Controllers

```typescript
@Controller('academic/students')  // Ruta base
export class StudentController {
    
    @Get()                        // GET /academic/students
    findAll() {}
    
    @Get(':id')                   // GET /academic/students/:id
    findOne(@Param('id') id) {}
    
    @Get('status/active')         // GET /academic/students/status/active
    findActive() {}
    
    @Post()                       // POST /academic/students
    create(@Body() dto) {}
    
    @Patch(':id')                 // PATCH /academic/students/:id
    update(@Param('id') id, @Body() dto) {}
    
    @Delete(':id')                // DELETE /academic/students/:id
    remove(@Param('id') id) {}
}
```

### Extracción de Parámetros

```typescript
// URL: /academic/subjects/career/1?status=active
@Get('career/:careerId')
findByCareer(
    @Param('careerId', ParseIntPipe) careerId: number,  // Del path /career/1
    @Query('status') status?: string                     // Del query ?status=active
) {
    // careerId = 1
    // status = "active"
}
```

---

## Cómo Buscar en VSCode

### 1. Buscar por ruta
**Ctrl + Shift + F** (Buscar en archivos)
```
Buscar: @Get('status/active')
```

### 2. Buscar por nombre de método
**Ctrl + Shift + F**
```
Buscar: findActiveWithCareer
```

### 3. Ir a definición
1. Haz clic en el método del controller (ej. `this.studentService.findActiveWithCareer()`)
2. Presiona **F12** o **Ctrl + Click**
3. Te lleva directamente al service

---

## Tips Rápidos

### ¿Qué hace cada verbo HTTP?

| Verbo | Acción | Ejemplo |
|-------|--------|---------|
| `GET` | Leer/Consultar | Listar estudiantes |
| `POST` | Crear | Crear matrícula |
| `PATCH` | Actualizar parcial | Actualizar email |
| `PUT` | Actualizar completo | Reemplazar estudiante |
| `DELETE` | Eliminar | Borrar carrera |

### ¿Cómo sé qué método llama el service?

En el controller, busca la línea:
```typescript
return this.SERVICIO.METODO();
```

Ejemplo:
```typescript
return this.studentService.findActiveWithCareer();
//      ↑ Servicio        ↑ Método a buscar
```

---

## Resumen Visual

```
PowerShell
   ↓
http://localhost:3000/academic/students/status/active
        ↓                 ↓             ↓
     Puerto         Módulo        Subruta
                       ↓
        src/academic/student/student.controller.ts
                @Get('status/active')
                findActive() {
                    return this.studentService.findActiveWithCareer();
                                    ↓
                            student.service.ts
                            findActiveWithCareer() {
                                return this.dataService.student.findMany();
                            }
                                    ↓
                            PostgreSQL Database
```

---

## Comandos de Ayuda

```powershell
# Abrir el controller en VSCode
code src/academic/student/student.controller.ts

# Buscar todos los controllers
Get-ChildItem -Path src/academic -Filter "*.controller.ts" -Recurse

# Buscar todos los services
Get-ChildItem -Path src/academic -Filter "*.service.ts" -Recurse
```
