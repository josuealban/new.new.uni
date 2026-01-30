# Gestión Universitaria - NestJS (Portafolio de Actividades)

Este repositorio contiene el desarrollo de las tareas académicas del módulo de Backend con NestJS, enfocándose en la persistencia de datos, ORM Prisma y transacciones complejas.

---

## 📅 SEMANA 11: Implementación de Prisma 7
**Tarea Académica: Integración de Prisma ORM en el Proyecto Backend**

Este proyecto cumple íntegramente con los requisitos de la Semana 11 mediante la siguiente implementación:

1.  **Configuración de Prisma 7**: Se instaló e inicializó Prisma Client (v7.x). El esquema está definido en `prisma/academic/schema-academic.prisma` y se utiliza una arquitectura multi-esquema con configuraciones dedicadas (`prisma.config.ts`).
2.  **Conexión a DB Local**: Conexión establecida con **PostgreSQL** mediante variables de entorno robustas en el archivo `.env`.
3.  **Migraciones**: Se han ejecutado migraciones exitosas que gestionan las tablas de `Student`, `Subject`, `Career`, `Enrollment`, entre otras, garantizando la consistencia de la estructura.
4.  **Automatización**: El archivo `package.json` incluye scripts personalizados:
    -   `npm run prisma:generate`: Genera los clientes.
    -   `npm run migrate:dev:all`: Ejecuta migraciones para todos los esquemas.
    -   `npm run db:setup`: Automatiza el despliegue completo.
5.  **Seed de Datos**: Implementación de un sistema de Seeding en `prisma/seeds/seed.academic.ts` que pobla la base de datos con datos reales del entorno universitario para pruebas inmediatas.

---

## 📅 SEMANA 13: Consultas Avanzadas y Transacciones ACID
**Actividad Práctica: Clase 3 - NestJS, Lógica y Transacciones**

Implementación avanzada de lógica de negocio y seguridad de datos:

### 1. Consultas Avanzadas (ORM)
- **Estudiantes Activos**: Lista con carga relacional (`include`) de carreras.
- **Asignaturas**: Filtrado por carrera.
- **Docentes**: Lógica para identificar carga horaria masiva (>1 materia).
- **Matrículas**: Historial por período.

### 2. Operaciones Lógicas (AND / OR / NOT)
- Búsqueda avanzada de estudiantes y filtros complejos de docentes basados en reglas de negocio dinámicas.

### 3. Reporte de SQL Nativo
- Implementación de `$queryRaw` para reportes estadísticos de alta eficiencia, utilizando concatenación de strings y agregaciones.

### 4. Transacción ACID de Matrícula
El proceso de inscripción (`EnrollmentService.create`) garantiza:
- **Atomicidad**: Todo el proceso de matrícula y descuento de cupo falla o tiene éxito como una unidad mediante `$transaction`.
- **Consistencia**: Validación de reglas de negocio antes de persistir.
- **Aislamiento**: Control de concurrencia en cupos.
- **Durabilidad**: Persistencia confirmada en PostgreSQL.

---

## ⚙️ Configuración y Ejecución

1. Configurar `.env` con las credenciales de PostgreSQL.
2. `npm install`
3. `npm run db:setup` (Sincroniza esquema, genera cliente y carga datos iniciales).
4. `npm run start:dev`

---
*Desarrollado por Josue Alban - Proyecto de Formación Avanzada NestJS*
