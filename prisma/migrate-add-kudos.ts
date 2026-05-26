/**
 * Adds the Kudos table.
 * Run with: npm run db:migrate-kudos
 */

import "dotenv/config";
import { Pool } from "@neondatabase/serverless";

const SQL = `
  CREATE TABLE IF NOT EXISTS "Kudos" (
    "id" TEXT NOT NULL,
    "giverId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Kudos_pkey" PRIMARY KEY ("id")
  );

  CREATE UNIQUE INDEX IF NOT EXISTS "Kudos_giverId_recipientId_moduleId_key"
    ON "Kudos"("giverId", "recipientId", "moduleId");
  CREATE INDEX IF NOT EXISTS "Kudos_recipientId_moduleId_idx"
    ON "Kudos"("recipientId", "moduleId");

  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Kudos_giverId_fkey') THEN
      ALTER TABLE "Kudos" ADD CONSTRAINT "Kudos_giverId_fkey"
        FOREIGN KEY ("giverId") REFERENCES "User"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Kudos_recipientId_fkey') THEN
      ALTER TABLE "Kudos" ADD CONSTRAINT "Kudos_recipientId_fkey"
        FOREIGN KEY ("recipientId") REFERENCES "User"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Kudos_moduleId_fkey') THEN
      ALTER TABLE "Kudos" ADD CONSTRAINT "Kudos_moduleId_fkey"
        FOREIGN KEY ("moduleId") REFERENCES "Module"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
  END $$;
`;

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    console.log("Adding Kudos table…");
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
