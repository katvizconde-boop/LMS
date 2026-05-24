/**
 * Adds the User.department column AND collapses MANAGER → EMPLOYEE.
 * Two roles only from this point: ADMIN and EMPLOYEE (displayed as "Learner").
 *
 * Idempotent. Run with: npm run db:migrate-department
 */

import "dotenv/config";
import { Pool } from "@neondatabase/serverless";

const SQL = `
  ALTER TABLE "User"
    ADD COLUMN IF NOT EXISTS "department" TEXT;

  UPDATE "User"
    SET "role" = 'EMPLOYEE'
    WHERE "role" = 'MANAGER';
`;

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set (check .env in lms-app/)");
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    console.log("Adding department column + collapsing MANAGER → EMPLOYEE…");
    const result = await client.query(SQL);
    console.log("✓ Done.", result);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
