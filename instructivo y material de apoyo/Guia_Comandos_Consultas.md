# Guía Maestra de Comandos PowerShell (Consulta y Gestión)

> [!IMPORTANT]
> **REGLA DE ORO:** Si un comando de creación (POST) falla con un **409 Conflict**, significa que el registro ya existe. Para la defensa, puedes simplemente usar los comandos de **Consulta (GET)**.

---

## ⚡ 0. ¡REINICIO TOTAL (Para una defensa limpia)!
Si quieres que todos los IDs de la guía coincidan exactamente y la base de datos esté "como nueva", ejecuta estos dos comandos:

```powershell
# 1. Borra todo y recrea las tablas
npx prisma db push --force-reset --schema=prisma/academic/schema-academic.prisma

# 2. Inserta los datos maestros (Estudiantes, Carreras, Períodos)
npx ts-node src/demo-queries.ts
```

---

## 🛠️ 1. Configuración de Base y Datos de Prueba (Seeding)
Usa estos comandos **solo si no hiciste el reinicio total** arriba.

### 1.1 Crear Docente Principal (Juan Pérez)
*Recuerda: El email y el userId deben ser únicos.*
```powershell
$body = @{ 
    userId = 999  # ID alto para evitar conflictos
    firstName = "Juan"
    lastName = "Perez"
    email = "docente.test@uni.edu" # Email nuevo
    employmentType = "FULL_TIME"
    isActive = $true 
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://localhost:3000/academic/teachers" -Body $body -ContentType "application/json"
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


---

## 🛡️ 3. Operaciones Transaccionales (ACID)
Comandos para demostrar la integridad de datos en procesos críticos.

### 3.1 Realizar Matriculación (Crear)
```powershell
# Intentar matricular al estudiante 1 en materia 5 (ya que 1, 2, 3 y 4 ya están ocupadas por el seeder)
$body = @{ studentId = 1; subjectId = 5; academicPeriodId = 1 } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/academic/enrollments" -Body $body -ContentType "application/json"
```

### 3.2 Cambio de Materia (PATCH)
```powershell
# Cambiar la matrícula ID 2 (del estudiante 1) a la materia ID 3 (Physics I)
$body = @{ subjectId = 3 } | ConvertTo-Json
Invoke-RestMethod -Method Patch -Uri "http://localhost:3000/academic/enrollments/2" -Body $body -ContentType "application/json"
```

### 3.3 Anular Matrícula (Delete)
```powershell
# Eliminar la matrícula ID 2
Invoke-RestMethod -Method Delete -Uri "http://localhost:3000/academic/enrollments/2"
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
