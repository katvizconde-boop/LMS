/**
 * Phase 6 incremental migration — adds the Bookmark table.
 *
 * Run once via `npm run db:migrate-bookmarks` (uses Neon's HTTPS WebSocket so
 * it works on networks that block port 5432). Idempotent — uses IF NOT EXISTS.
 */

import "dotenv/config";
import { Pool } from "@neondatabase/serverless";

const SQL = `
  CREATE TABLE IF NOT EXISTS "Bookmark" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
  );

  CREATE UNIQUE INDEX IF NOT EXISTS "Bookmark_userId_moduleId_key"
    ON "Bookmark"("userId", "moduleId");
  CREATE INDEX IF NOT EXISTS "Bookmark_userId_idx"
    ON "Bookmark"("userId");

  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'Bookmark_userId_fkey'
    ) THEN
      ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'Bookmark_moduleId_fkey'
    ) THEN
      ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_moduleId_fkey"
        FOREIGN KEY ("moduleId") REFERENCES "Module"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
  END $$;
`;

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set (check .env in lms-app/)");
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    console.log("Adding Bookmark table…");
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
