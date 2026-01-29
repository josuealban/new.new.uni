import 'dotenv/config';
import { PrismaClient } from './generated/client-academic';

// Configurar URL de conexión si no existe, usando la de Academic por defecto
if (!process.env.DATABASE_URL && process.env.DATABASE_ACADEMIC_URL) {
    process.env.DATABASE_URL = process.env.DATABASE_ACADEMIC_URL;
}

async function main() {
    // Inicializamos el cliente de Prisma
    const prisma = new PrismaClient({})
    console.log('🚀 Iniciando demostración de consultas NestJS/Prisma...\n');

    try {
        // ==========================================
        // 1. Consultas Derivadas (Fluent API)
        // ==========================================
        console.log('--- 1. Consultas Derivadas ---');

        // findMany: Obtener registros con paginación y ordenamiento
        // Equivalente a: SELECT * FROM careers ORDER BY name ASC LIMIT 5;
        const careers = await prisma.career.findMany({
            take: 5,
            orderBy: { name: 'asc' },
            include: { specialty: true }, // Eager loading (JOIN)
        });
        console.log(`✅ findMany (Carreras): Se encontraron ${careers.length} carreras.`);
        if (careers.length > 0) {
            console.log(`   Ejemplo: ${careers[0].name} (Especialidad: ${careers[0].specialty.name})`);
        }

        // findFirst: Obtener el primer registro que cumpla una condición
        const subject = await prisma.subject.findFirst({
            where: {
                credits: { gte: 3 } // "gte" = Greater Than or Equal (Mayor o igual)
            }
        });
        console.log(`✅ findFirst (Materia >= 3 créditos): ${subject?.name || 'No encontrada'}`);


        // ==========================================
        // 2. Operaciones Lógicas (AND, OR, NOT)
        // ==========================================
        console.log('\n--- 2. Operaciones Lógicas ---');

        // Combinación de condiciones
        const teachers = await prisma.teacher.findMany({
            where: {
                OR: [
                    { employmentType: 'FULL_TIME' },
                    { firstName: { contains: 'Dr.', mode: 'insensitive' } } // Búsqueda insensible a mayúsculas
                ],
                AND: {
                    isActive: true
                }
            },
            take: 3
        });
        console.log(`✅ Filtro complejo (AND/OR): ${teachers.length} profesores encontrados.`);


        // ==========================================
        // 3. Consultas Nativas (Raw SQL)
        // ==========================================
        console.log('\n--- 3. Consultas Nativas (SQL) ---');

        // REPORTE SOLICITADO:
        // Nombre del estudiante, Carrera, Número total de materias matriculadas
        // Ordenado por número de materias (descendente)
        try {
            console.log('📊 Generando reporte de estudiantes y materias matriculadas...');
            const studentReport: any[] = await prisma.$queryRaw`
                SELECT 
                    s.first_name || ' ' || s.last_name as "Nombre Estudiante",
                    c.name as "Carrera",
                    COUNT(e.id)::int as "Total Materias"
                FROM students s
                JOIN careers c ON s.career_id = c.id
                LEFT JOIN enrollments e ON s.id = e.student_id
                GROUP BY s.id, s.first_name, s.last_name, c.name
                ORDER BY "Total Materias" DESC
                LIMIT 5;
            `;

            console.table(studentReport);
            console.log(`✅ SQL Nativo Reporte: ${studentReport.length} filas recuperadas.`);

        } catch (e) {
            console.log('⚠️ SQL Nativo Reporte: Error al ejecutar:', e);
        }


        // ==========================================
        // 4. Transacciones y Principios ACID
        // ==========================================
        console.log('\n--- 4. Transacciones (ACID) ---');
        console.log('ℹ️ Caso de Uso: Matriculación con validación de cupos (Atomicidad garantizada).');

        const txStudent = await prisma.student.findFirst({ where: { isActive: true } });
        const txSubject = await prisma.subject.findFirst({ where: { availableQuota: { gt: 0 } } });
        const txPeriod = await prisma.academicPeriod.findFirst({ where: { isActive: true } });

        if (txStudent && txSubject && txPeriod) {
            try {
                const result = await prisma.$transaction(async (tx) => {
                    // Paso 1: Verificar estudiante activo (Bloqueo pesimista opcional, aquí validación lógica)
                    // En una transacción real, podríamos volver a consultar para asegurar estado actual.
                    const studentCheck = await tx.student.findUnique({ where: { id: txStudent.id } });
                    if (!studentCheck?.isActive) {
                        throw new Error(`Estudiante ${studentCheck?.id} no está activo.`);
                    }

                    // Paso 2: Verificar disponibilidad de cupos (LOWER LEVEL LOCKING recommended for production, here logic check)
                    // Para mayor seguridad en concurrencia real se usaría UPDATE ... WHERE available_quota > 0 con chequeo de filas afectadas.
                    const subjectCheck = await tx.subject.findUnique({ where: { id: txSubject.id } });
                    if (!subjectCheck || subjectCheck.availableQuota <= 0) {
                        throw new Error(`Asignatura ${txSubject.name} sin cupos disponibles.`);
                    }

                    // Paso 3: Registrar matrícula
                    const newEnrollment = await tx.enrollment.create({
                        data: {
                            studentId: txStudent.id,
                            subjectId: txSubject.id,
                            academicPeriodId: txPeriod.id
                        }
                    });

                    // Paso 4: Descontar cupo
                    await tx.subject.update({
                        where: { id: txSubject.id },
                        data: {
                            availableQuota: {
                                decrement: 1
                            }
                        }
                    });

                    // Simulación de error aleatorio para probar ROLLBACK (50% probabilidad en demo)
                    // if (Math.random() < 0.5) throw new Error("Error simulado de red durante el cobro.");

                    return newEnrollment;
                });

                console.log(`✅ Transacción EXITOSA (COMMIT):`);
                console.log(`   - Estudiante ID ${txStudent.id} matriculado en materia ID ${txSubject.id}.`);
                console.log(`   - Cupo descontado correctamente.`);

            } catch (error) {
                // Si falla por "Foreign Key constraint failed" es porque ya está matriculado (Unique constraint)
                if (error.code === 'P2002') {
                    console.log(`ℹ️ Transacción abortada: El estudiante ya está matriculado en esta materia (Constraint Unique).`);
                } else {
                    console.log(`❌ Transacción FALLIDA (ROLLBACK): ${error.message}`);
                    console.log(`   - Ningún cambio se aplicó a la base de datos (Cupo intacto).`);
                }
            }
        } else {
            console.log('⚠️ No se pudo probar la transacción de matrícula: Faltan datos semilla (estudiante, materia o periodo).');
        }

    } catch (error) {
        console.error('\n❌ Error General:', error);
    } finally {
        // Cerrar conexión
        await prisma.$disconnect();
    }
}

main();
