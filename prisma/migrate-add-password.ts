/**
 * Adds the User.passwordHash column. Idempotent.
 * Run with: npm run db:migrate-password
 */

import "dotenv/config";
import { Pool } from "@neondatabase/serverless";

const SQL = `
  ALTER TABLE "User"
    ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;
`;

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set (check .env in lms-app/)");
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    console.log("Adding User.passwordHash column…");
    await client.query(SQL);
    console.log("✓ Done.");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
