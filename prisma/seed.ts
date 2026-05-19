/**
 * Seed script — runs `npm run db:seed`.
 *
 * Creates:
 *   - 4 entities (M2, MMI, RDB, 7GEN shared)
 *   - 1 admin user (kat.vizconde@seven-gen.com)
 *   - 1 demo manager (manager.demo@seven-gen.com) with 2 direct reports
 *   - 1 program ("Claude at Work", Jun–Dec 2026)
 *   - 7 modules of curriculum content (see prisma/curriculum.ts)
 *   - Enrollments for all 4 users
 *   - 1 demo submission from Jasmine for Module 01 so the manager queue has data
 *
 * Re-runnable:
 *   - Users, entities, program, and module *metadata* upsert in place
 *   - Module *content* (sections, quizzes, exercise) is wiped + recreated each run
 *   - User progress (ModuleProgress, Bookmark, Submission) is preserved
 *   - Quiz answers + section views are cascaded away when quizzes/sections rebuild
 */

import "dotenv/config";
import { PrismaClient, UserRole } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { CLAUDE_AT_WORK_MODULES, type ModuleSpec } from "./curriculum";

const ADMIN_EMAIL = "kat.vizconde@seven-gen.com";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set (check .env in lms-app/)");
  }
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
  const db = new PrismaClient({ adapter });

  // ============ ENTITIES ============
  const [m2, mmi, rdb, sg] = await Promise.all([
    db.entity.upsert({
      where: { code: "M2" },
      create: { code: "M2", name: "M2.0 Communications" },
      update: {},
    }),
    db.entity.upsert({
      where: { code: "MMI" },
      create: { code: "MMI", name: "Media Meter Inc." },
      update: {},
    }),
    db.entity.upsert({
      where: { code: "RDB" },
      create: { code: "RDB", name: "Rythmos DB Inc." },
      update: {},
    }),
    db.entity.upsert({
      where: { code: "7GEN" },
      create: { code: "7GEN", name: "Seven Generation Group (shared)" },
      update: {},
    }),
  ]);

  // ============ USERS ============
  const admin = await db.user.upsert({
    where: { email: ADMIN_EMAIL },
    create: {
      email: ADMIN_EMAIL,
      name: "Kat Vizconde",
      role: UserRole.ADMIN,
      entityId: sg.id,
    },
    update: { role: UserRole.ADMIN, name: "Kat Vizconde" },
  });

  const demoManager = await db.user.upsert({
    where: { email: "manager.demo@seven-gen.com" },
    create: {
      email: "manager.demo@seven-gen.com",
      name: "Maria Santos",
      role: UserRole.MANAGER,
      entityId: m2.id,
    },
    update: { role: UserRole.MANAGER },
  });

  const demoEmployee1 = await db.user.upsert({
    where: { email: "employee.demo@seven-gen.com" },
    create: {
      email: "employee.demo@seven-gen.com",
      name: "Jasmine Reyes",
      role: UserRole.EMPLOYEE,
      entityId: m2.id,
      managerId: demoManager.id,
    },
    update: { managerId: demoManager.id },
  });

  const demoEmployee2 = await db.user.upsert({
    where: { email: "employee2.demo@seven-gen.com" },
    create: {
      email: "employee2.demo@seven-gen.com",
      name: "Mark Cruz",
      role: UserRole.EMPLOYEE,
      entityId: mmi.id,
      managerId: demoManager.id,
    },
    update: { managerId: demoManager.id },
  });

  // ============ PROGRAM ============
  const program = await db.program.upsert({
    where: { slug: "claude-at-work" },
    create: {
      slug: "claude-at-work",
      title: "Claude at Work",
      subtitle:
        "A 7-month curriculum on using Claude safely and effectively across all Seven Generation teams.",
      description:
        "From your first conversation to advanced prompting and multi-step workflows — designed for every role at M2, MMI, and RDB.",
      ownerId: admin.id,
      startDate: new Date("2026-06-01T00:00:00Z"),
      endDate: new Date("2026-12-31T23:59:59Z"),
      audienceRules: {
        entities: ["M2", "MMI", "RDB"],
        roles: ["EMPLOYEE", "MANAGER", "ADMIN"],
      },
    },
    update: {},
  });

  // ============ ENROLLMENTS ============
  for (const u of [admin, demoManager, demoEmployee1, demoEmployee2]) {
    await db.enrollment.upsert({
      where: { userId_programId: { userId: u.id, programId: program.id } },
      create: { userId: u.id, programId: program.id },
      update: {},
    });
  }

  // ============ MODULES (upsert metadata, rebuild content) ============
  const firstModuleId = await seedModule(db, program.id, CLAUDE_AT_WORK_MODULES[0]);
  for (const spec of CLAUDE_AT_WORK_MODULES.slice(1)) {
    await seedModule(db, program.id, spec);
  }

  // ============ DEMO SUBMISSION ============
  // Jasmine submits a reflection for Module 01 so Maria's review queue has data on every fresh seed.
  await db.submission.deleteMany({
    where: { userId: demoEmployee1.id, moduleId: firstModuleId },
  });
  await db.submission.create({
    data: {
      userId: demoEmployee1.id,
      moduleId: firstModuleId,
      content:
        "I used Claude to help summarize a long client brief and pull out the top 3 priorities. It got the structure right, but missed two nuances the client had emphasized verbally — so I'd add a note about that context in the prompt next time. Quick win overall.",
      status: "PENDING",
    },
  });

  console.log("");
  console.log("✓ Entities  :", [m2.code, mmi.code, rdb.code, sg.code].join(", "));
  console.log("✓ Admin     :", admin.email, `(${admin.role})`);
  console.log("✓ Manager   :", demoManager.email, `(${demoManager.role})`);
  console.log("✓ Employees :", demoEmployee1.email + ",", demoEmployee2.email);
  console.log("✓ Program   :", program.title, `[${program.slug}]`);
  for (const spec of CLAUDE_AT_WORK_MODULES) {
    console.log(
      `✓ Module ${spec.number}   :`,
      spec.title,
      `(unlocks ${spec.availableFrom.toISOString().slice(0, 10)})`,
    );
  }
  console.log("");
  console.log("Done.");
}

/**
 * Upsert a module's metadata + replace its content (sections, quizzes, exercise).
 * Returns the module id so the caller can hang demo submissions off it.
 */
async function seedModule(
  db: PrismaClient,
  programId: string,
  spec: ModuleSpec,
): Promise<string> {
  const meta = {
    number: spec.number,
    title: spec.title,
    subtitle: spec.subtitle,
    heroSubtitle: spec.heroSubtitle,
    level: spec.level,
    durationMinutes: spec.durationMinutes,
    audienceLabel: spec.audienceLabel,
    availableFrom: spec.availableFrom,
    learningObjectives: spec.learningObjectives,
  };

  const mod = await db.module.upsert({
    where: { programId_position: { programId, position: spec.position } },
    create: { programId, position: spec.position, ...meta },
    update: meta,
  });

  // Wipe and recreate content. Cascades take out QuizAnswer + SectionView; intentional.
  await Promise.all([
    db.section.deleteMany({ where: { moduleId: mod.id } }),
    db.quiz.deleteMany({ where: { moduleId: mod.id } }),
    db.exercise.deleteMany({ where: { moduleId: mod.id } }),
  ]);

  // Create sections (we use Promise.all so they go in parallel — position is preserved by data).
  await Promise.all(
    spec.sections().map((s) =>
      db.section.create({
        data: {
          moduleId: mod.id,
          position: s.position,
          number: s.number,
          title: s.title,
          type: s.type,
          content: s.content as object,
        },
      }),
    ),
  );

  await Promise.all(
    spec.quizzes().map((q) =>
      db.quiz.create({
        data: {
          moduleId: mod.id,
          position: q.position,
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
          feedback: q.feedback,
        },
      }),
    ),
  );

  if (spec.exercise) {
    await db.exercise.create({
      data: {
        moduleId: mod.id,
        title: spec.exercise.title,
        instructions: spec.exercise.instructions,
      },
    });
  }

  return mod.id;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
