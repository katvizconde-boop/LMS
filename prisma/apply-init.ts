/**
 * Applies prisma/init.sql against the Neon database via @neondatabase/serverless
 * (WebSocket transport over port 443) — used in environments where outbound
 * port 5432 is blocked.
 *
 * Run: `npm run db:apply-init`
 *
 * This is a one-time bootstrap. Subsequent schema changes will need another
 * generated SQL file + this script re-run, OR `prisma migrate dev` from a
 * network that can reach port 5432.
 */

import "dotenv/config";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "@neondatabase/serverless";

const here = dirname(fileURLToPath(import.meta.url));

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  let ddl = readFileSync(join(here, "init.sql"), "utf8");
  // Strip UTF-8 BOM if a Windows tool re-saved the file
  if (ddl.charCodeAt(0) === 0xfeff) ddl = ddl.slice(1);

  const pool = new Pool({ connectionString: url });
  const client = await pool.connect();
  try {
    console.log("Applying schema to Neon…");
    await client.query(ddl);
    console.log("✓ Schema applied.");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
