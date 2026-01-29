# Guía Completa: Consultas Avanzadas y Transacciones en NestJS (Prisma)

Este documento sirve como material de apoyo e instructivo para dominar el manejo de datos en NestJS utilizando Prisma ORM. A continuación, se detallan los conceptos clave solicitados.

## 🚀 Ejecución de la Demostración Práctica

Para ver en acción todas las consultas (Derivadas, Nativas, Lógicas y Transaccionales) que se explican en este documento, hemos preparado un script automático en el proyecto.

**Comando para ejecutar en PowerShell:**

```powershell
$env:DATABASE_URL=$env:DATABASE_ACADEMIC_URL; npx ts-node src/demo-queries.ts
```

Este comando:
1.  Configura temporalmente la variable de entorno `DATABASE_URL` usando la de tu esquema académico.
2.  Ejecuta el script `demo-queries.ts` que imprimirá en consola los resultados de los ejemplos abajo citados.

---

## 1. Consultas Derivadas en NestJS

### ¿Qué son?
Las consultas derivadas (o *Derived Queries*) se refieren al uso de la "Fluent API" del ORM. En lugar de escribir SQL manual, utilizas métodos (funciones) que el ORM proporciona para "derivar" la consulta SQL automáticamente.

**Ventajas:**
- Código más limpio y legible (TypeScript).
- Seguridad de tipos (autocompletado).
- Protección automática contra inyección SQL.

### Métodos Comunes (Prisma Client)

| Método | Descripción | Equivalente SQL (Aprox) |
| :--- | :--- | :--- |
| `findMany` | Recupera múltiples registros que coinciden con un filtro. | `SELECT * FROM table WHERE ...` |
| `findUnique` | Busca un **único** registro por un campo único (ID, email). | `SELECT * FROM table WHERE id = ? LIMIT 1` |
| `findFirst` | Retorna el **primer** registro que cumple una condición (sin ser campo único). | `SELECT * FROM table WHERE ... LIMIT 1` |

### `select` e `include`
* **`select`**: Permite elegir qué columnas específicas devolver (proyección). Reduce la carga de datos.
* **`include`**: Realiza un JOIN ("Eager Loading") para traer datos de tablas relacionadas.

```typescript
// Ejemplo de uso de include y select
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: { posts: true }, // Trae todos los posts del usuario
  // O BIEN (no se pueden usar ambos al mismo nivel)
  // select: { id: true, email: true } 
});
```

### Consultas con Ordenamiento y Paginación
Ideal para listas largas o tablas en el frontend.

```typescript
const users = await prisma.user.findMany({
  take: 10,              // LIMIT 10 (Paginación: Cantidad)
  skip: 0,               // OFFSET 0 (Paginación: Desde dónde saltar)
  orderBy: {
    createdAt: 'desc',   // ORDER BY created_at DESC
  },
});
```

### Caso de Uso en Servicios (`service.ts`)
En NestJS, estas consultas se encapsulan dentro de los métodos del servicio.

```typescript
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  findAllActive() {
    return this.prisma.user.findMany({ where: { isActive: true } });
  }
}
```

---

## 2. Consultas Nativas en NestJS

### ¿Qué son?
Son consultas escritas directamente en lenguaje SQL (Raw SQL). Se saltan la capa de abstracción del ORM y se ejecutan directamente en la base de datos.

### Diferencia: ORM vs SQL Nativo
* **ORM**: Abstracción, más lento en consultas muy complejas, fácil de mantener.
* **Nativo**: Control total, máximo rendimiento, pero dependiente del motor de base de datos (Postgres, MySQL, etc.).

### Ejecución de Consultas Nativas

#### Lectura (`$queryRaw`)
Devuelve un array de objetos. Prisma mapea los resultados automáticamente.

```typescript
const email = 'juan@test.com';
// Mapeo seguro de parámetros usando Template Tagged Literals (evita inyección)
const users = await prisma.$queryRaw`SELECT * FROM users WHERE email = ${email}`;
```

#### Escritura/Modificación (`$executeRaw`)
Devuelve el número de filas afectadas. Se usa para `INSERT`, `UPDATE`, `DELETE`.

```typescript
const affectedRows = await prisma.$executeRaw`UPDATE users SET active = true WHERE last_login > NOW()`;
```

### Ejemplo Práctico: Reporte de Estudiantes (Solicitado)
Calcula el número de materias matriculadas por estudiante, ordenado descendentemente.

```typescript
const report = await prisma.$queryRaw`
  SELECT 
      s.first_name || ' ' || s.last_name as "Nombre Estudiante",
      c.name as "Carrera",
      COUNT(e.id)::int as "Total Materias"
  FROM students s
  JOIN careers c ON s.career_id = c.id
  LEFT JOIN enrollments e ON s.id = e.student_id
  GROUP BY s.id, s.first_name, s.last_name, c.name
  ORDER BY "Total Materias" DESC
`;
```

---

## 3. Operaciones Lógicas

### Operadores más usados (Filtros en `where`)

* **AND**: Todas las condiciones deben cumplirse.
* **OR**: Al menos una condición debe cumplirse.
* **NOT**: Invierte la condición.

```typescript
const result = await prisma.product.findMany({
  where: {
    OR: [
      { price: { gt: 100 } },          // Precio > 100
      { stock: { equals: 0 } },        // O Stock = 0
    ],
    NOT: {
      category: 'Electronics'          // Y NO sea de Electrónica
    }
  }
});
```

### Filtros Dinámicos desde Controladores
En APIs REST, construye el objeto `where` dinámicamente según los *Query Params*.

```typescript
// Controller
@Get()
findAll(@Query('search') search: string) {
  const whereClause = search ? { 
    OR: [{ title: { contains: search } }, { content: { contains: search } }] 
  } : {};
  return this.prisma.post.findMany({ where: whereClause });
}
```

---

## 4. Operaciones Transaccionales

### ¿Qué es una transacción?
Es un conjunto de operaciones que se ejecutan como una **unidad indivisible**. O todas se aplican, o ninguna, garantizando la consistencia de los datos.

### Ejemplo Completo: Matriculación con Validación de Cupos
Flujo requerido: Verificar estudiante, verificar cupo, matricular, descontar cupo.

```typescript
await prisma.$transaction(async (tx) => {
    // 1. Verificar estudiante activo
    const student = await tx.student.findUnique({ where: { id: studentId } });
    if (!student.isActive) throw new Error("Estudiante inactivo");

    // 2. Verificar cupos
    const subject = await tx.subject.findUnique({ where: { id: subjectId } });
    if (subject.availableQuota <= 0) throw new Error("Sin cupos");

    // 3. Registrar matrícula
    const enrollment = await tx.enrollment.create({
        data: { studentId, subjectId, academicPeriodId }
    });

    // 4. Descontar cupo
    await tx.subject.update({
        where: { id: subjectId },
        data: { availableQuota: { decrement: 1 } }
    });

    return enrollment;
});
```

---

## 5. Principios ACID aplicados a NestJS

Un análisis de cómo los principios ACID protegen la integridad de tu sistema universitario.

### ⚛️ **A**tomicidad (Atomicity)
**"Todo o nada"**.
En el proceso de matriculación (ver Parte 4), realizamos múltiples escrituras: crear el registro en la tabla `enrollements` y actualizar el contador en la tabla `subjects`.
La atomicidad garantiza que **si falla la actualización del cupo (ej. error de base de datos), la matrícula JAMÁS se crea**. Esto evita tener estudiantes matriculados en materias sin cupo real, o materias con cupos descontados pero sin estudiantes asignados ("registros huérfanos").

### 🛡️ **C**onsistencia (Consistency)
**"Reglas del juego siempre válidas"**.
La base de datos siempre pasa de un estado válido a otro válido. NestJS y Prisma ayudan a mantener esto mediante:
*   **Constraints (Integridad Referencial):** No puedes matricular a un estudiante (ID 999) si ese ID no existe en la tabla `students`.
*   **Reglas de Negocio:** En nuestra transacción, forzamos la regla "El cupo no puede ser negativo". Si intentamos hacer un `decrement` cuando el valor es 0, y la columna tiene una restricción `CHECK (available_quota >= 0)`, la DB rechazará la operación y la transacción se revertirá, manteniendo los datos consistentes.

### 🕵️ **I**solation (Aislamiento)
**"Sin interferencias en concurrencia"**.
Imagina que dos estudiantes, Ana y Luis, intentan matricularse AL MISMO TIEMPO en "Programación I" cuando **solo queda 1 cupo**.
Sin aislamiento, ambos podrían leer `availableQuota: 1`, ambos pasan la validación, y ambos se matriculan, dejando el cupo en -1 (Overbooking).
Las transacciones aíslan estos procesos. Dependiendo del nivel de aislamiento (ej. *Serializable* o *Read Committed* con bloqueos), la base de datos "formará en fila" las peticiones o detectará el conflicto, permitiendo que solo uno tenga éxito y obligando al otro a fallar o reintentar.

### 💾 **D**urabilidad (Durability)
**"Lo guardado es permanente"**.
Una vez que el servidor responde `201 Created` al estudiante confirmando su matrícula, esa información está grabada en el disco duro de la base de datos.
Incluso si el servidor de NestJS se reinicia o hay un corte de energía en el data center 1 milisegundo después, **la matrícula no se pierde**. Esto es crucial en sistemas académicos donde la pérdida de notas o matrículas tendría consecuencias legales y académicas graves.

---

### Resumen Rápido

| Concepto | Herramienta Prisma | Ejemplo de Uso |
| :--- | :--- | :--- |
| **Consultas Simples** | `findMany`, `findUnique` | Listar usuarios, ver perfil. |
| **Relaciones** | `include` | Ver usuario con sus posts. |
| **Reportes complejos** | `$queryRaw` (SQL) | Gráficos de analítica avanzados. |
| **Seguridad de datos** | `$transaction` | Transferencia de dinero, inscripciones. |
