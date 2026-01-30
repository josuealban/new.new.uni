# Análisis de los Principios ACID en el Sistema de Matriculación

Este documento analiza cómo se aplican los principios **ACID** (Atomicidad, Consistencia, Aislamiento, Durabilidad) específicamente en el proceso de matriculación de estudiantes del sistema universitario.

## 1. Atomicidad (Todo o Nada)
**Contexto:** Un estudiante intenta matricularse en una materia.
**Aplicación:** La operación de matriculación implica varios pasos:
1.  Verificar que el estudiante esté activo.
2.  Verificar que la materia tenga cupos disponibles.
3.  Crear el registro en la tabla `Enrollment`.
4.  Descontar un cupo en la tabla `Subject`.

**Garantía:** Si cualquiera de estos pasos falla (ej. se va la luz justo después de crear el registro pero antes de descontar el cupo), la base de datos **revierte (rollback)** todos los cambios anteriores. Esto asegura que nunca tendremos una matrícula creada sin que se haya descontado el cupo correspondiente. La matrícula ocurre completamente o no ocurre en absoluto.

## 2. Consistencia (Integridad de los Datos)
**Contexto:** Las reglas del negocio y restricciones de la base de datos deben respetarse siempre.
**Aplicación:**
*   **Restricciones de Integridad:** La base de datos no permitirá matricular a un `student_id` que no exista (Foreign Key).
*   **Reglas de Negocio:** No se puede descontar cupos si el contador llega a cero (validación lógica antes de la escritura).
*   **Estado Válido:** Al finalizar la transacción, la base de datos pasa de un estado válido (cupos = 30) a otro estado válido (cupos = 29, matrícula creada). Nunca quedará en un estado intermedio o inválido (ej. cupos negativos).

## 3. Aislamiento (Concurrencia)
**Contexto:** Varios estudiantes intentan matricularse en la misma materia **simultáneamente** (al mismo milisegundo).
**Aplicación:** El nivel de aislamiento determina cómo estas transacciones concurrentes se ven entre sí.
*   Sin aislamiento adecuado, dos estudiantes podrían leer que queda "1 cupo" al mismo tiempo, ambos se matriculan, y el cupo baja a -1 (Condición de carrera).
*   **Solución en NestJS/Prisma:** Al utilizar transacciones interactivas (`$transaction`), el ORM gestiona el bloqueo o la serialización necesaria para que la transacción B espere a que la transacción A termine de leer y escribir el cupo. Así, el segundo estudiante verá correctamente que ya no hay cupos.

## 4. Durabilidad (Persistencia)
**Contexto:** Una vez que el sistema confirma "Matrícula Exitosa".
**Aplicación:** Los datos se han guardado permanentemente en el disco duro del servidor de base de datos (PostgreSQL/MySQL).
*   Incluso si el servidor se apaga, se reinicia o falla catastróficamente un segundo después de la confirmación, la matrícula **no se perderá**.
*   Esto es crítico en un sistema universitario para asegurar que el registro académico del estudiante perdure a través del tiempo y los fallos del sistema, garantizando su historial académico y derechos adquiridos.
