/**
 * Provision Shermaine Angeles for pilot testing.
 * Idempotent — safe to re-run.
 *
 * Usage: npm run db:add-shermaine
 */

import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient, UserRole } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const EMAIL = "shermaine.angeles@seven-gen.com";
const NAME = "Shermaine Angeles";
const PASSWORD = "Welcome2026!";
// Adjust entity/department after Kat confirms — defaulting to shared 7GEN + HR.
const ENTITY_CODE = "7GEN";
const DEPARTMENT = "HR";

// Programs to enroll her in. Pilot covers Claude 101 + the HR playbook.
const PROGRAM_SLUGS = ["claude-at-work", "claude-playbook", "claude-for-hr"];

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
  const db = new PrismaClient({ adapter });

  const entity = await db.entity.findUnique({ where: { code: ENTITY_CODE } });
  if (!entity) throw new Error(`Entity ${ENTITY_CODE} not found — run db:seed first`);

  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  const user = await db.user.upsert({
    where: { email: EMAIL },
    create: {
      email: EMAIL,
      name: NAME,
      role: UserRole.EMPLOYEE,
      entityId: entity.id,
      department: DEPARTMENT,
      passwordHash,
    },
    update: {
      name: NAME,
      role: UserRole.EMPLOYEE,
      entityId: entity.id,
      department: DEPARTMENT,
      passwordHash, // reset password on each run
    },
  });

  let enrolledCount = 0;
  for (const slug of PROGRAM_SLUGS) {
    const program = await db.program.findUnique({ where: { slug } });
    if (!program) {
      console.warn(`  ! Program "${slug}" not found, skipping`);
      continue;
    }
    await db.enrollment.upsert({
      where: { userId_programId: { userId: user.id, programId: program.id } },
      create: { userId: user.id, programId: program.id },
      update: {},
    });
    enrolledCount += 1;
  }

  console.log("");
  console.log(`✓ User       : ${user.email}`);
  console.log(`✓ Name       : ${user.name}`);
  console.log(`✓ Entity     : ${entity.code} (${entity.name})`);
  console.log(`✓ Department : ${user.department}`);
  console.log(`✓ Role       : ${user.role}`);
  console.log(`✓ Programs   : ${enrolledCount} enrolled`);
  console.log(`✓ Password   : ${PASSWORD}  (tell her to change via /profile)`);
  console.log("");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
