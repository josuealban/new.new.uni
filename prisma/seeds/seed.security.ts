import "dotenv/config";
import { PrismaClient } from "../../src/generated/client-security";

async function main() {
    const prisma = new PrismaClient();

    await prisma.rolePermission.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.permission.deleteMany();
    await prisma.role.deleteMany();
    await prisma.user.deleteMany();

    const adminRole = await prisma.role.create({
        data: { name: "ADMIN", description: "Administrador" },
    });

    const perm = await prisma.permission.create({
        data: { name: "MANAGE_ENROLLMENTS", description: "Gestionar matrículas" },
    });

    await prisma.rolePermission.create({
        data: { roleId: adminRole.id, permissionId: perm.id },
    });

    const user = await prisma.user.create({
        data: {
            name: "Admin",
            email: "admin@uni.edu",
            username: "admin",
            password: "hashed-demo", // si luego quieres bcrypt real, lo hacemos
            isActive: true,
        },
    });

    await prisma.userRole.create({
        data: { userId: user.id, roleId: adminRole.id },
    });

    console.log("✅ Security seed OK");
    await prisma.$disconnect();
}

main().catch(async (e) => {
    console.error(e);
    process.exit(1);
});
