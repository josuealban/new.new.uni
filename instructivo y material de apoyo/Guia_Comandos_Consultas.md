# Guía Maestra de Comandos PowerShell (Consulta y Gestión)

Este documento es el catálogo definitivo de comandos para probar, gestionar y verificar todo el sistema académico desde PowerShell.

---

## 🛠️ 1. Configuración de Base y Datos de Prueba (Seeding)
Usa estos comandos para preparar los datos iniciales recomendados para las demostraciones.

### 1.1 Crear Docente Principal (Juan Pérez)
```powershell
$body = @{ 
    userId = 100
    firstName = "Juan"
    lastName = "Perez"
    email = "juan.perez@uni.edu"
    employmentType = "FULL_TIME"
    isActive = $true 
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://localhost:3000/academic/teachers" -Body $body -ContentType "application/json"
```

### 1.2 Crear Materias y Asignar Carga Académica
```powershell
# Crear Materia A
$m1 = @{ name="Math I"; credits=4; maxQuota=30; availableQuota=30; careerId=1; cycleId=1 } | ConvertTo-Json
$res1 = Invoke-RestMethod -Method Post -Uri "http://localhost:3000/academic/subjects" -Body $m1 -ContentType "application/json"

# Asignar al docente (ID 1)
$asig = @{ teacherId=1; subjectId=$res1.id } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/academic/teacher-subjects" -Body $asig -ContentType "application/json"
```

---

## 🔍 2. Consultas de la Actividad Práctica

### PARTE 1: Consultas Derivadas (ORM)
| Funcionalidad | Comando PowerShell |
|---------------|-------------------|
| **Estudiantes Activos** | `Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/students/status/active"` |
| **Materias por Carrera** | `Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/subjects/career/1"` |
| **Docente Multi-materia** | `Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/teachers/status/multi-subject"` |
| **Matrículas Estudiante** | `Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/enrollments/student/1/period/1"` |

### PARTE 2: Operaciones Lógicas (AND, OR, NOT)
| Funcionalidad | Comando PowerShell |
|---------------|-------------------|
| **Búsqueda Estudiantes** | `Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/students/search/advanced?careerId=1&periodId=1"` |
| **Filtro Docentes** | `Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/teachers/filter/advanced"` |

### PARTE 3: Consultas Nativas (SQL Puro)
| Funcionalidad | Comando PowerShell |
|---------------|-------------------|
| **Reporte de Estudiantes**| `Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/enrollments/report/native-stats"` |

---

## 🛡️ 3. Operaciones Transaccionales (ACID)
Comandos para demostrar la integridad de datos en procesos críticos.

### 3.1 Realizar Matriculación (Crear)
```powershell
$body = @{ studentId = 1; subjectId = 1; academicPeriodId = 1 } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/academic/enrollments" -Body $body -ContentType "application/json"
```

### 3.2 Cambio de Materia (Update con Traspaso de Cupos)
```powershell
# Cambiar matrícula ID 1 a materia ID 2 (Descuenta en materia 2 y devuelve a materia 1)
$body = @{ subjectId = 2 } | ConvertTo-Json
Invoke-RestMethod -Method Patch -Uri "http://localhost:3000/academic/enrollments/1" -Body $body -ContentType "application/json"
```

### 3.3 Anular Matrícula (Delete con Devolución de Cupo)
```powershell
Invoke-RestMethod -Method Delete -Uri "http://localhost:3000/academic/enrollments/1"
```

---

## 📊 4. Comandos de Verificación General (Reportes Rápidos)

### Listar todo lo existente
| Recurso | Comando |
|---------|---------|
| **Estudiantes** | `Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/students"` |
| **Carreras** | `Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/careers"` |
| **Materias** | `Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/subjects"` |
| **Docentes** | `Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/teachers"` |
| **Matrículas** | `Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/enrollments"` |

### Ver detalle con relaciones (Deep View)
```powershell
# Ver qué materias dicta el docente ID 1 (Incluye la lista de materias)
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/teachers/1" | ConvertTo-Json -Depth 5
```

---

## 🏁 5. Comandos de Entorno
| Acción | Comando |
|--------|---------|
| **Iniciar API** | `npm run start:dev` |
| **Reiniciar DB** | `npx prisma db push --force-reset` |
| **Verificar DB** | `npx ts-node src/check-db.ts` |
| **Ejecutar Script Demo** | `npx ts-node src/demo-queries.ts` |

---

## 💡 Tips de Presentación
- Usa `| Out-GridView` al final de cualquier comando GET para mostrar los resultados en una ventana tipo Excel.
- Si el comando POST/PATCH da error 409, explica que es el **bloqueo de integridad ACID** funcionando.
- Usa `ConvertTo-Json -Depth 10` si quieres ver toda la información de las relaciones anidadas.
