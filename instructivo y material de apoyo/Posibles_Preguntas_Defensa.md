# Guía de Posibles Preguntas para la Defensa

Este documento contiene una lista de preguntas técnicas que un ingeniero podría hacer durante la presentación, clasificadas por área temática, junto con sus respectivas respuestas sugeridas y referencias al código.

---

## 🏗️ Sección 1: NestJS y Arquitectura

**1. ¿Cuál es la diferencia entre un Controller y un Service en tu implementación?**
*   **Respuesta:** El **Controller** se encarga de la capa de entrada (rutas HTTP, validación de DTOs y manejo de errores de entrada). El **Service** contiene la lógica de negocio y se comunica con la base de datos a través de Prisma. Esta separación sigue el principio de responsabilidad única (SRP).
*   **Referencia:** Mira `src/academic/student/student.controller.ts` vs `src/academic/student/student.service.ts`.

**2. ¿Para qué utilizas los "DTOs" y los "Pipes"?**
*   **Respuesta:** Los **DTOs (Data Transfer Objects)** definen la forma de los datos que esperamos (ej. `CreateEnrollmentDto`). Los **Pipes** (como `ParseIntPipe`) transforman o validan los datos de entrada automáticamente antes de que lleguen al método del controller.
*   **Referencia:** `src/academic/enrollment/dto/create-enrollment.dto.ts`.

---

## 🔍 Sección 2: Consultas Derivadas y Lógicas (ORM)

**3. ¿Cómo manejas las relaciones entre tablas en tus consultas?**
*   **Respuesta:** Utilizo la propiedad `include` de Prisma. Esto realiza un `JOIN` automático bajo el capó para traer datos relacionados (como la carrera de un estudiante) en una sola consulta.
*   **Referencia:** Método `findActiveWithCareer` en `student.service.ts`.

**4. ¿Por qué usaste un operador `AND` en la búsqueda avanzada en lugar de filtros individuales?**
*   **Respuesta:** Para garantizar que los resultados cumplan estrictamente con todos los criterios simultáneamente (Activo + Carrera + Período). Prisma traduce esto a una cláusula `WHERE` con múltiples condiciones.
*   **Referencia:** Método `searchAdvanced` en `student.service.ts`.

---

## 🐚 Sección 3: Consultas Nativas (SQL)

**5. ¿Por qué decidiste usar `$queryRaw` para el reporte de estudiantes en lugar del ORM?**
*   **Respuesta:** Por eficiencia y control. El reporte requiere agregaciones (`COUNT`), concatenaciones de strings (`||`) y agrupaciones (`GROUP BY`). En SQL puro, estas operaciones son más directas y de mejor rendimiento para reportes complejos que en los métodos estándar del ORM.
*   **Referencia:** Método `getNativeStudentReport` en `enrollment.service.ts`.

**6. ¿Cómo proteges tu consulta nativa contra Inyección SQL?**
*   **Respuesta:** Utilizo **Tagged Templates** de Prisma. Al escribir la query como `$queryRaw`seguido de una cadena con backticks, Prisma automáticamente sanitiza y escapa todos los valores, convirtiéndolos en parámetros seguros.
*   **Referencia:** `Explicacion_Consultas_Nativas.md` -> Sección 3.2.

---

## 🛡️ Sección 4: Transacciones y ACID

**7. Explícame paso a paso cómo garantizas la integridad en la matriculación.**
*   **Respuesta:** Uso `$transaction`. Si el proceso falla en cualquier punto (ej. no hay cupos o el estudiante ya está inscrito), el sistema hace un **Rollback**. Esto asegura que nunca se descuente un cupo si no se creó la matrícula.
*   **Referencia:** Método `create` en `enrollment.service.ts`.

**8. ¿Cómo aplicas el principio de "Aislamiento" (Isolation) en tus transacciones?**
*   **Respuesta:** Al usar la transacción de base de datos, PostgreSQL bloquea o gestiona los registros afectados de modo que dos peticiones simultáneas no puedan "robarse" el último cupo disponible.
*   **Referencia:** `Analisis_ACID_Matriculacion.md`.

---

## 🚀 Sección 5: Desarrollo y Herramientas

**9. ¿Si el servidor da un error 500 al hacer una matrícula, qué suele ser lo primero que revisarías?**
*   **Respuesta:** Primero revisaría que el cuerpo (Body) de la petición esté completo. Un error 500 suele ocurrir si el servidor intenta acceder a una propiedad que no fue enviada. Luego revisaría los logs de NestJS para ver el stack trace.

**10. ¿Cómo escalarias la consulta de docentes con múltiples asignaturas si la base de datos tuviera millones de registros?**
*   **Respuesta:** Actualmente el filtrado se hace en memoria. Para millones de registros, movería esa lógica a una consulta nativa con `GROUP BY` y `HAVING COUNT(*) > 1` para que el motor de la base de datos haga el trabajo pesado de filtrado.

---

## 💡 Consejos de Oro para tu Defensa:
- **Sé honesto:** Si algo no lo sabes, di: *"No tengo el detalle exacto en este momento, pero sé que se encuentra documentado en mi Guía de Ubicación de Código para su revisión rápida"*.
- **Demuestra con comandos:** Si te piden probar algo, usa los comandos de tu `Guia_Comandos_Consultas.md`.
- **Muestra los documentos:** Si la explicación es compleja, abre el PDF/Markdown correspondiente que creamos.
