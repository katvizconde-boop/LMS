/**
 * Rename Kudos columns from giverId/recipientId to fromUserId/toUserId to
 * match the Prisma schema. Adds the missing emoji column. Idempotent.
 */

import "dotenv/config";
import { Pool } from "@neondatabase/serverless";

const SQL = `
  DO $$
  BEGIN
    -- Rename columns if old names exist
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'Kudos' AND column_name = 'giverId'
    ) THEN
      ALTER TABLE "Kudos" RENAME COLUMN "giverId" TO "fromUserId";
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'Kudos' AND column_name = 'recipientId'
    ) THEN
      ALTER TABLE "Kudos" RENAME COLUMN "recipientId" TO "toUserId";
    END IF;

    -- Add emoji column if missing
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'Kudos' AND column_name = 'emoji'
    ) THEN
      ALTER TABLE "Kudos" ADD COLUMN "emoji" TEXT NOT NULL DEFAULT '👏';
    END IF;

    -- Drop old unique constraint if present
    IF EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'Kudos_giverId_recipientId_moduleId_key'
    ) THEN
      ALTER TABLE "Kudos" DROP CONSTRAINT "Kudos_giverId_recipientId_moduleId_key";
    END IF;

    -- Add new unique constraint if missing
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'Kudos_fromUserId_toUserId_moduleId_key'
    ) THEN
      ALTER TABLE "Kudos" ADD CONSTRAINT "Kudos_fromUserId_toUserId_moduleId_key"
        UNIQUE("fromUserId", "toUserId", "moduleId");
    END IF;

    -- Drop old foreign-key constraints if present
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Kudos_giverId_fkey') THEN
      ALTER TABLE "Kudos" DROP CONSTRAINT "Kudos_giverId_fkey";
    END IF;
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Kudos_recipientId_fkey') THEN
      ALTER TABLE "Kudos" DROP CONSTRAINT "Kudos_recipientId_fkey";
    END IF;

    -- Add new foreign-key constraints if missing
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Kudos_fromUserId_fkey') THEN
      ALTER TABLE "Kudos" ADD CONSTRAINT "Kudos_fromUserId_fkey"
        FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Kudos_toUserId_fkey') THEN
      ALTER TABLE "Kudos" ADD CONSTRAINT "Kudos_toUserId_fkey"
        FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
  END $$;

  -- Drop old indexes; create new ones
  DROP INDEX IF EXISTS "Kudos_recipientId_moduleId_idx";
  CREATE INDEX IF NOT EXISTS "Kudos_toUserId_idx" ON "Kudos"("toUserId");
  CREATE INDEX IF NOT EXISTS "Kudos_moduleId_idx" ON "Kudos"("moduleId");
`;

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    console.log("Fixing Kudos column names…");
    await client.query(SQL);
    console.log("✓ Done.");

    // Verify
    const r = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'Kudos' ORDER BY ordinal_position
    `);
    console.log("Columns now:", r.rows.map((x) => x.column_name).join(", "));
  } finally {
    client.release();
    await pool.end();
  }
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
