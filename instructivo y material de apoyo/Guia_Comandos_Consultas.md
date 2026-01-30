# Guía de Comandos PowerShell para Consultas y Operaciones Avanzadas en NestJS

Este documento detalla cómo ejecutar y probar las diferentes operaciones de base de datos (derivadas, nativas, transaccionales) utilizando PowerShell. Se asume que la aplicación se está ejecutando en `http://localhost:3000`.

Primero, asegúrate de que tu aplicación esté corriendo:
```powershell
npm run start:dev
```

---

## 1. Consultas Derivadas (ORM)
**Concepto:** Consultas construidas utilizando los métodos estándar de Prisma (`findMany`, `findUnique`) con relaciones (`include`).

### Listar matrículas de un estudiante en un periodo específico
**Función:** Esta consulta utiliza `findMany` con filtros `where` para buscar matrículas específicas.
**Comando PowerShell:**
```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/enrollments/student/1/period/1"
```
*(Nota: Reemplaza `1` por el ID real del estudiante y periodo)*

---

## 2. Consultas Nativas (SQL Puro)
**Concepto:** Consultas escritas directamente en SQL utilizando `$queryRaw` para reportes complejos o rendimiento.

### Obtener reporte de estadísticas (Ejemplo)
**Función:** Ejecuta una consulta SQL nativa (`SELECT ... FROM ... JOIN`) definida en el servicio para obtener estadísticas de matriculación.
**Comando PowerShell:**
```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/academic/enrollments/report/native-stats"
```

---

## 3. Operaciones Lógicas (Filtros Avanzados)
**Concepto:** Uso de operadores `AND`, `OR`, `NOT`, `gte` (mayor o igual), `contains` dentro de las consultas.

### Probar filtros lógicos (Script Demo)
**Función:** Ejecuta un script de demostración que realiza búsquedas con filtros complejos (ej. buscar profesores por nombre O tipo de empleo).
**Comando PowerShell:**
```powershell
npx ts-node src/demo-queries.ts
```
*(Observar la sección "2. Operaciones Lógicas" en la salida de la consola)*

---

## 4. Operaciones Transaccionales y Principios ACID
**Concepto:** Garantizar que un conjunto de operaciones se ejecuten todas o ninguna (`Atomicidad`), manteniendo la integridad de los datos (`Consistencia`).

### Crear una Matrícula (Transacción con Validación de Cupos)
**Función:** Intenta matricular a un estudiante. El backend utiliza `prisma.$transaction` para verificar cupos, crear la matrícula y descontar el cupo atómicamente.
**Comando PowerShell:**
```powershell
$body = @{
    studentId = 1
    subjectId = 2
    academicPeriodId = 1
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://localhost:3000/academic/enrollments" -Body $body -ContentType "application/json"
```

### Simulación de Fallo (Rollback)
Para verificar la propiedad de **Atomicidad** (ACID):
1. Intenta matricularte en una materia sin cupos.
2. O modifica el código para lanzar un error intencional dentro de la transacción.
3. Verifica que no se haya cobrado ni descontado cupo si falla.

---

## 5. Resumen de Ejecución desde Consola (Script Completo)
Si deseas ver una demostración automática de **todos** estos conceptos (Consultas Derivadas, SQL Nativo, Lógica y Transacciones ACID) sin usar la API, puedes ejecutar el script preparado para este fin:

**Función:** Ejecuta `src/demo-queries.ts` que contiene ejemplos de código para cada uno de los 5 puntos solicitados.
**Comando PowerShell:**
```powershell
npx ts-node src/demo-queries.ts
```
