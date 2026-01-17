import "dotenv/config";
import { PrismaClient } from "../../src/generated/client-help";

async function main() {
    const prisma = new PrismaClient();

    // TODO: ajusta según tus modelos help
    // await prisma.ticket.deleteMany();

    console.log("✅ Help seed OK (ajusta modelos según schema-help)");
    await prisma.$disconnect();
}

main().catch(async (e) => {
    console.error(e);
    process.exit(1);
});
