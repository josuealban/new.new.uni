# Guía de Uso con Postman 🚀

Si prefieres usar Postman en lugar de PowerShell, aquí tienes la configuración exacta para cada petición.

---

## 📥 1. Importación Rápida
Puedes crear una nueva **Colección** en Postman y añadir estas peticiones:

### ⚙️ Configuración Global
- **Base URL:** `http://localhost:3000`
- **Headers:** 
  - `Content-Type: application/json`

---

## 🔍 2. Consultas (GET)

### Listar Estudiantes Activos
- **Método:** `GET`
- **URL:** `{{base_url}}/academic/students/status/active`

### Reporte Nativo (SQL)
- **Método:** `GET`
- **URL:** `{{base_url}}/academic/enrollments/report/native-stats`

---

## 🛡️ 3. Transacciones (POST / PATCH / DELETE)

### 3.1 Nueva Matriculación
- **Método:** `POST`
- **URL:** `{{base_url}}/academic/enrollments`
- **Body (raw JSON):**
```json
{
    "studentId": 1,
    "subjectId": 5,
    "academicPeriodId": 1
}
```

### 3.2 Cambio de Materia (PATCH)
- **Método:** `PATCH`
- **URL:** `{{base_url}}/academic/enrollments/2`
- **Body (raw JSON):**
```json
{
    "subjectId": 3
}
```

### 3.3 Eliminar Matrícula
- **Método:** `DELETE`
- **URL:** `{{base_url}}/academic/enrollments/2`

---

## ⚡ 4. Solución de Problemas en Postman

1. **Error 409 (Conflict):** Significa que el dato ya existe. Si estás probando una matrícula, cambia el `subjectId` o borra la matrícula anterior.
2. **Error 404 (Not Found):** El ID que pusiste en la URL (ej. `/enrollments/6`) no existe. Haz un `GET` a `/academic/enrollments` para ver qué IDs tienes disponibles.
3. **Error 500:** Verifica que el JSON en el **Body** esté bien escrito (con comillas dobles y sin comas al final).

> [!TIP]
> Si la base de datos se vuelve un caos de tantos IDs, usa el comando de **Reinicio Total** de la Guía de PowerShell para dejar todo en cero.
