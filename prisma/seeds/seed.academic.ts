import "dotenv/config";
import { PrismaClient } from "../../src/generated/client-academic";

async function main() {
    const prisma = new PrismaClient();

    // Limpieza (orden por FK)
    await prisma.enrollment.deleteMany();
    await prisma.teacherSubject.deleteMany();
    await prisma.studentSubject.deleteMany();
    await prisma.teacher.deleteMany();
    await prisma.student.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.career.deleteMany();
    await prisma.cycle.deleteMany();
    await prisma.specialty.deleteMany();
    await prisma.academicPeriod.deleteMany();

    // Specialty + Career
    const specialty = await prisma.specialty.create({
        data: { name: "Ingeniería", description: "Área de ingeniería" },
    });

    const career = await prisma.career.create({
        data: {
            name: "Software",
            totalCycles: 8,
            durationYears: 4,
            specialtyId: specialty.id,
        },
    });

    // Cycles
    const cycle1 = await prisma.cycle.create({ data: { name: "Ciclo 1", number: 1 } });
    const cycle2 = await prisma.cycle.create({ data: { name: "Ciclo 2", number: 2 } });

    // Subjects (con cupos)
    const subjectA = await prisma.subject.create({
        data: {
            name: "Programación I",
            credits: 5,
            maxQuota: 2,
            availableQuota: 2,
            careerId: career.id,
            cycleId: cycle1.id,
        },
    });

    const subjectB = await prisma.subject.create({
        data: {
            name: "Bases de Datos I",
            credits: 5,
            maxQuota: 30,
            availableQuota: 30,
            careerId: career.id,
            cycleId: cycle2.id,
        },
    });

    // Teachers (dos materias para cumplir “>1 asignatura”)
    const teacher1 = await prisma.teacher.create({
        data: {
            userId: 1001,
            firstName: "Ana",
            lastName: "Paz",
            email: "ana.paz@uni.edu",
            isActive: true,
            employmentType: "FULL_TIME",
        },
    });

    const teacher2 = await prisma.teacher.create({
        data: {
            userId: 1002,
            firstName: "Luis",
            lastName: "Vera",
            email: "luis.vera@uni.edu",
            isActive: true,
            employmentType: "PART_TIME",
        },
    });

    await prisma.teacherSubject.createMany({
        data: [
            { teacherId: teacher1.id, subjectId: subjectA.id },
            { teacherId: teacher1.id, subjectId: subjectB.id },
            { teacherId: teacher2.id, subjectId: subjectB.id },
        ],
        skipDuplicates: true,
    });

    // Students
    const student1 = await prisma.student.create({
        data: {
            userId: 2001,
            firstName: "Josué",
            lastName: "Albán",
            email: "josue.alban@uni.edu",
            isActive: true,
            careerId: career.id,
        },
    });

    const student2 = await prisma.student.create({
        data: {
            userId: 2002,
            firstName: "María",
            lastName: "Loja",
            email: "maria.loja@uni.edu",
            isActive: false, // para probar “estudiante inactivo”
            careerId: career.id,
        },
    });

    // Academic Period
    const period = await prisma.academicPeriod.create({
        data: {
            name: "2026-1",
            startDate: new Date("2026-01-01"),
            endDate: new Date("2026-06-30"),
            isActive: true,
        },
    });

    // Matrículas iniciales (para pruebas de reportes)
    await prisma.enrollment.createMany({
        data: [
            { studentId: student1.id, subjectId: subjectB.id, academicPeriodId: period.id },
        ],
        skipDuplicates: true,
    });

    console.log("✅ Academic seed OK");
    await prisma.$disconnect();
}

main().catch(async (e) => {
    console.error(e);
    process.exit(1);
});
