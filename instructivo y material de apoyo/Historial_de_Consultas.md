# Historial Completo de Cambios y Consultas

Este documento registra cronológicamente todas las operaciones, comandos y cambios realizados en el sistema desde el inicio de la actividad práctica.

---

## 🕒 Línea de Tiempo de Implementación

### Fase 1: Preparación y Entorno
*   **Acción:** Verificación de la base de datos y tablas existentes.
*   **Comando:** `npx ts-node src/check-db.ts`
*   **Resultado:** Confirmación de conexión a PostgreSQL y estado de las tablas.

### Fase 2: Documentación de Comandos Base
*   **Acción:** Creación de guías de referencia para PowerShell, NPM y Git.
*   **Documento:** `Guia_Comandos_PowerShell.md`
*   **Propósito:** Establecer los comandos estándar para el flujo de trabajo.

### Fase 3: Parte 1 - Consultas Derivadas (ORM)
Implementación de consultas usando métodos nativos de Prisma (`findMany`).

| Comando PowerShell | Explicación | Tipo | Transaccional |
|-------------------|-------------|------|----------------|
| `Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/students/status/active"` | Estudiantes activos con su carrera asociada. | Derivada | No |
| `Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/subjects/career/1"` | Listado de materias por carrera específica. | Derivada | No |
| `Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/teachers/status/multi-subject"` | Docentes con más de una materia asignada. | Derivada | No |
| `Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/enrollments/student/1/period/1"` | Historial de matrículas por estudiante y período. | Derivada | No |

### Fase 4: Parte 2 - Operaciones Lógicas
Uso de operadores `AND`, `OR` y `NOT` para filtros complejos.

| Comando PowerShell | Explicación | Tipo | Transaccional |
|-------------------|-------------|------|----------------|
| `Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/students/search/advanced?careerId=1&periodId=1"` | Filtro AND: Activos + Carrera + Período. | Lógica | No |
| `Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/teachers/filter/advanced"` | Filtro complejo: Tiempo completo AND (Materias OR Activos). | Lógica | No |

### Fase 5: Parte 3 - Consultas Nativas (SQL)
Implementación de reportes avanzados usando SQL puro con `$queryRaw`.

| Comando PowerShell | Explicación | Tipo | Transaccional |
|-------------------|-------------|------|----------------|
| `Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/enrollments/report/native-stats"` | Reporte de carga académica por estudiante con INNER/LEFT JOIN y GROUP BY. | Nativa | No |

### Fase 6: Parte 4 - Transacciones ACID
Garantía de integridad en procesos de escritura múltiple.

| Comando PowerShell | Explicación | Tipo | Transaccional |
|-------------------|-------------|------|----------------|
| `Invoke-RestMethod -Method Post -Uri "http://localhost:3000/academic/enrollments" -Body $body...` | **Matriculación:** Valida cupos y descuenta automáticamente. | Transacción | **SÍ** |
| `Invoke-RestMethod -Method Patch -Uri "http://localhost:3000/academic/enrollments/7" -Body @{subjectId=2}...` | **Cambio de Materia:** Traspasa cupos entre materias de forma segura. | Transacción | **SÍ** |
| `Invoke-RestMethod -Method Delete -Uri "http://localhost:3000/academic/enrollments/1"` | **Eliminación:** Borra registro y restaura cupo. | Transacción | **SÍ** |

---

## 🛠️ Log de Comandos de Preparación de Datos (Seeding Manual)

A continuación, los comandos utilizados para poblar la base de datos durante las pruebas:

1.  **Crear Profesor "Juan Perez":**
    ```powershell
    $body = @{ userId = 100; firstName = "Juan"; lastName = "Perez"; email = "juan.perez@uni.edu"; employmentType = "FULL_TIME"; isActive = $true } | ConvertTo-Json
    Invoke-RestMethod -Method Post -Uri "http://localhost:3000/academic/teachers" -Body $body -ContentType "application/json"
    ```

2.  **Crear Profesora "Maria Rodriguez":**
    ```powershell
    $body = @{ userId = 101; firstName = "Maria"; lastName = "Rodriguez"; email = "maria.rodriguez@uni.edu"; employmentType = "FULL_TIME"; isActive = $true } | ConvertTo-Json
    Invoke-RestMethod -Method Post -Uri "http://localhost:3000/academic/teachers" -Body $body -ContentType "application/json"
    ```

3.  **Crear Materias de Prueba:**
    ```powershell
    # Mathematics I (ID 2), Physics I (ID 3), English I (ID 4)
    # Calculus I (ID 5), General Chemistry (ID 6), Biology I (ID 7)
    ```

4.  **Asignar Carga Académica (Teacher-Subjects):**
    ```powershell
    # Juan Perez (ID 1) asignado a IDs 2, 3, 4.
    # Maria Rodriguez (ID 2) asignada a IDs 5, 6, 7.
    ```

---

## 💡 Resumen de Hallazgos Técnicos

*   **Consultas N+1:** Se evitaron usando `include` en las consultas derivadas.
*   **Inyección SQL:** Se previno mediante el uso de *tagged templates* en `$queryRaw`.
*   **Consistencia de Datos:** Se garantizó mediante `$transaction` en todos los procesos que afectan cupos.
*   **Manejo de Errores:** Se implementaron códigos HTTP semánticos (400, 404, 409, 500).

---

## 🏁 Estado Actual del Proyecto
- [x] Implementación de todas las consultas solicitadas.
- [x] Documentación técnica de cada parte.
- [x] Guía de explicación verbal para la defensa.
- [x] Historial completo de comandos verificado.
