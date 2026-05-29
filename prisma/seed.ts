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
import bcrypt from "bcryptjs";
import { PrismaClient, UserRole } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import {
  CLAUDE_AT_WORK_PROGRAM,
  type ModuleSpec,
  type ProgramSpec,
} from "./curriculum";
import { CLAUDE_PLAYBOOK_PROGRAM } from "./curriculum-playbook";

const PROGRAMS: ProgramSpec[] = [CLAUDE_AT_WORK_PROGRAM, CLAUDE_PLAYBOOK_PROGRAM];

const ADMIN_EMAIL = "kat.vizconde@seven-gen.com";
const DEMO_PASSWORD = "Welcome2026!";

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
  // Every seeded user gets the same demo password. Tell them to change it
  // from /profile on first sign-in.
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const admin = await db.user.upsert({
    where: { email: ADMIN_EMAIL },
    create: {
      email: ADMIN_EMAIL,
      name: "Kat Vizconde",
      role: UserRole.ADMIN,
      entityId: sg.id,
      department: "HR / L&D",
      passwordHash,
    },
    update: {
      role: UserRole.ADMIN,
      name: "Kat Vizconde",
      department: "HR / L&D",
      passwordHash,
    },
  });

  // Two roles only: Admin (above) and Learner (everyone else).
  const demoLearner1 = await db.user.upsert({
    where: { email: "manager.demo@seven-gen.com" },
    create: {
      email: "manager.demo@seven-gen.com",
      name: "Maria Santos",
      role: UserRole.EMPLOYEE,
      entityId: m2.id,
      department: "Account Management",
      passwordHash,
    },
    update: {
      role: UserRole.EMPLOYEE,
      department: "Account Management",
      passwordHash,
    },
  });

  const demoLearner2 = await db.user.upsert({
    where: { email: "employee.demo@seven-gen.com" },
    create: {
      email: "employee.demo@seven-gen.com",
      name: "Jasmine Reyes",
      role: UserRole.EMPLOYEE,
      entityId: m2.id,
      department: "PR Strategy",
      passwordHash,
    },
    update: { department: "PR Strategy", passwordHash },
  });

  const demoLearner3 = await db.user.upsert({
    where: { email: "employee2.demo@seven-gen.com" },
    create: {
      email: "employee2.demo@seven-gen.com",
      name: "Mark Cruz",
      role: UserRole.EMPLOYEE,
      entityId: mmi.id,
      department: "Media Monitoring",
      passwordHash,
    },
    update: { department: "Media Monitoring", passwordHash },
  });

  // Legacy aliases used elsewhere in this file
  const demoManager = demoLearner1;
  const demoEmployee1 = demoLearner2;
  const demoEmployee2 = demoLearner3;

  // ============ PROGRAMS + MODULES ============
  const allUsers = [admin, demoManager, demoEmployee1, demoEmployee2];
  let firstModuleIdOfFirstProgram = "";

  for (const spec of PROGRAMS) {
    const program = await db.program.upsert({
      where: { slug: spec.slug },
      create: {
        slug: spec.slug,
        title: spec.title,
        subtitle: spec.subtitle,
        description: spec.description,
        ownerId: admin.id,
        startDate: spec.startDate,
        endDate: spec.endDate,
        audienceRules: spec.audienceRules,
      },
      update: {
        title: spec.title,
        subtitle: spec.subtitle,
        description: spec.description,
        startDate: spec.startDate,
        endDate: spec.endDate,
      },
    });

    // Enroll every demo user in every program.
    for (const u of allUsers) {
      await db.enrollment.upsert({
        where: { userId_programId: { userId: u.id, programId: program.id } },
        create: { userId: u.id, programId: program.id },
        update: {},
      });
    }

    // Modules: upsert metadata + rebuild content for each.
    const firstModule = await seedModule(db, program.id, spec.modules[0]);
    for (const m of spec.modules.slice(1)) {
      await seedModule(db, program.id, m);
    }
    if (!firstModuleIdOfFirstProgram) firstModuleIdOfFirstProgram = firstModule;
  }

  const firstModuleId = firstModuleIdOfFirstProgram;

  // ============ DEMO SUBMISSION ============
  // Jasmine submits a reflection for Module 01 (of Claude at Work) so the review queue has data.
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
  console.log("✓ Entities :", [m2.code, mmi.code, rdb.code, sg.code].join(", "));
  console.log("✓ Admin    :", admin.email);
  console.log("✓ Learners :", [demoLearner1, demoLearner2, demoLearner3].map(u => u.email).join(", "));
  console.log(`✓ All demo users password: "${DEMO_PASSWORD}" (change via /profile)`);
  for (const spec of PROGRAMS) {
    console.log(`✓ Program   : ${spec.title} [${spec.slug}] — ${spec.modules.length} modules`);
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
