import "dotenv/config";
import { Client } from "pg";

async function test(name: string, url?: string) {
  const conn = url ?? "";
  if (!conn) {
    console.log(`⚠️ ${name}: URL vacía (no hay variable de entorno)`);
    return;
  }

  const client = new Client({ connectionString: conn });

  try {
    await client.connect();
    const r = await client.query("SELECT current_database() AS db, current_schema() AS schema, 1 AS ok;");
    console.log(`✅ ${name}: OK`, r.rows[0]);
  } catch (e: any) {
    console.log(`❌ ${name}: FAIL ->`, e?.message ?? e);
  } finally {
    try { await client.end(); } catch {}
  }
}

async function main() {
  await test("ACADEMIC", process.env.DATABASE_ACADEMIC_URL ?? process.env.DATABASE_URL);
  await test("SECURITY", process.env.DATABASE_SECURITY_URL);
  await test("HELP", process.env.DATABASE_HELP_URL);
}

main();
