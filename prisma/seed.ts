/**
 * Seed script — runs `npm run db:seed`.
 *
 * Creates:
 *   - 4 entities (M2, MMI, RDB, 7GEN shared)
 *   - 1 admin user (kat.vizconde@seven-gen.com)
 *   - 1 program ("Claude at Work", Jun–Dec 2026)
 *   - Module 01 (Meet Claude) with 13 section rows, 3 quizzes, 1 exercise
 *   - Module 02 placeholder (Prompting Basics) for the "Coming Next" footer
 *   - Enrollment of the admin user in Claude at Work
 *
 * Idempotent — uses upserts keyed on stable natural keys.
 */

import "dotenv/config";
import { PrismaClient, ModuleLevel, UserRole, SectionType } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import type {
  ComparisonContent,
  ExampleCardContent,
  ObjectivesBoxContent,
  ParagraphPart,
  TextContent,
  TryItContent,
} from "../lib/section-content";

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
  // Admin (you)
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

  // Demo manager — for testing the manager flow.
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

  // Demo employees reporting to demoManager.
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

  // ============ PROGRAM: Claude at Work ============
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

  // Enroll admin + demo manager + demo employees in Claude at Work.
  for (const u of [admin, demoManager, demoEmployee1, demoEmployee2]) {
    await db.enrollment.upsert({
      where: { userId_programId: { userId: u.id, programId: program.id } },
      create: { userId: u.id, programId: program.id },
      update: {},
    });
  }

  // ============ MODULE 01: Meet Claude ============
  await db.module.deleteMany({ where: { programId: program.id, position: 1 } });

  const mod1 = await db.module.create({
    data: {
      programId: program.id,
      position: 1,
      number: "01",
      title: "Meet Claude.",
      subtitle:
        "What Claude is, how to talk to it, and how to use it safely with company work.",
      heroSubtitle:
        "Your first step into working with AI — what Claude actually is, how to talk to it, and how to use it safely with company and client work.",
      level: ModuleLevel.FOUNDATION,
      durationMinutes: 35,
      audienceLabel: "All employees — M2, MMI, RDB",
      availableFrom: new Date("2026-06-01T00:00:00Z"),
      learningObjectives: [
        "Understand what Claude is — and what it isn't",
        "Access Claude through your company-approved account",
        "Hold your first useful conversation with Claude",
        "Know what work you can and cannot put into Claude",
        "Recognize when Claude is wrong (yes, it happens)",
      ],
      sections: {
        create: module01Sections(),
      },
      quizzes: {
        create: module01Quizzes(),
      },
      exercise: {
        create: {
          title: "Module 01 — Submission",
          instructions: {
            intro: undefined,
            steps: [
              "Have one real conversation with Claude about a current work task — keep it under 15 minutes",
              "In 3–5 sentences, describe: what task you tried, what Claude got right, and where it fell short",
              "Note one thing you'd do differently next time",
              "Submit to your manager via email or the form linked in your invitation",
            ],
            deadlineNote: "Deadline: end of June 2026",
          },
        },
      },
    },
  });

  // ============ MODULE 02 placeholder (for "Coming Next") ============
  await db.module.upsert({
    where: { programId_position: { programId: program.id, position: 2 } },
    create: {
      programId: program.id,
      position: 2,
      number: "02",
      title: "Prompting Basics",
      subtitle:
        "Context, clarity, structure — and the common mistakes that waste your time.",
      heroSubtitle:
        "Now that you've met Claude, it's time to learn how to talk to it well.",
      level: ModuleLevel.FOUNDATION,
      durationMinutes: 30,
      audienceLabel: "All employees — M2, MMI, RDB",
      availableFrom: new Date("2026-07-01T00:00:00Z"),
      learningObjectives: [],
    },
    update: {},
  });

  // ============ DEMO SUBMISSION (for testing manager review flow) ============
  // Jasmine (demoEmployee1) submits a reflection so Maria has something to review.
  await db.submission.deleteMany({
    where: {
      userId: demoEmployee1.id,
      moduleId: mod1.id,
    },
  });
  await db.submission.create({
    data: {
      userId: demoEmployee1.id,
      moduleId: mod1.id,
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
  console.log("✓ Module 01 :", mod1.title, `(${mod1.position})`);
  console.log("");
  console.log("Done.");
}

// ============================================================
// Module 01 — Section content
// ============================================================

function p(...parts: ParagraphPart[]): ParagraphPart[] {
  return parts;
}
function s(text: string) {
  return { strong: text };
}

function module01Sections() {
  let pos = 0;
  const next = () => ++pos;

  // ----- Logical 01: What you'll learn -----
  const section01: ObjectivesBoxContent = {
    intro:
      "This is a foundation module. By the end of it, you'll be able to log into Claude, hold a productive first conversation, and understand the rules of the road when using it with Seven Generation work.",
    label: "Learning Objectives",
    items: [
      "Understand what Claude is — and what it isn't",
      "Access Claude through your company-approved account",
      "Hold your first useful conversation with Claude",
      "Know what work you can and cannot put into Claude",
      "Recognize when Claude is wrong (yes, it happens)",
    ],
  };

  // ----- Logical 02: So, what is Claude? -----
  const section02Text: TextContent = {
    paragraphs: [
      p(
        "Claude is an AI assistant made by a company called Anthropic. You can talk to it the same way you'd message a colleague — typing questions, sharing documents, asking for help — and it responds in plain English (or Filipino, or Taglish — it understands all of them).",
      ),
      p(
        s("Think of Claude as a very fast, very knowledgeable assistant"),
        " who has read most of the internet up to early 2026, never gets tired, never judges your \"stupid\" questions, and can help with writing, research, analysis, brainstorming, and almost any text-based task.",
      ),
      p(
        "But — and this matters — Claude is not magic, not always right, and not a replacement for your professional judgment. It's a tool. A powerful one. You're the one driving.",
      ),
    ],
  };
  const section02Comparison: ComparisonContent = {
    goodLabel: "✓ What Claude is good at",
    goodText:
      "Drafting, summarizing, brainstorming, explaining, structuring messy thoughts, second-pair-of-eyes review, translating, formatting",
    badLabel: "✗ What Claude isn't",
    badText:
      "A live search engine, a calculator for confidential math, a source of real-time prices, a replacement for legal or financial advice, infallible",
  };

  // ----- Logical 03: Accessing Claude at Seven Generation -----
  const section03Text: TextContent = {
    paragraphs: [
      p(
        "Seven Generation uses Claude as our standardized AI assistant across M2.0 Communications, Media Meter, and Rythmos DB. Before using it for work, make sure you're using the ",
        s("company-provided account"),
        " — not a personal account.",
      ),
      p(
        "Why this matters: company accounts give us data protection, conversation history that stays inside the organization, and the right licensing tier for the work you do.",
      ),
    ],
  };
  const section03Checklist: ExampleCardContent = {
    label: "Quick Setup Checklist",
    checklist: [
      "Receive your account credentials from 7gen IT",
      "Log in at claude.ai using your work email",
      "Bookmark the page",
      "Read the Acceptable Use Policy (linked in your onboarding email)",
      "Send your first \"hello\" — you're in!",
    ],
  };

  // ----- Logical 04: Your first real conversation -----
  const section04Intro: TextContent = {
    paragraphs: [
      p(
        "The biggest mistake new users make is treating Claude like Google. Don't type one-word searches. Talk to it like you'd talk to a smart, eager intern who just walked into your office.",
      ),
    ],
  };
  const section04Comparison: ComparisonContent = {
    mono: true,
    badLabel: "✗ Don't do this",
    badText: '"press release sample"',
    goodLabel: "✓ Do this",
    goodText:
      '"Draft a 250-word press release announcing our client\'s new product launch. Tone should be professional but conversational. Target audience: tech journalists in the Philippines."',
  };
  const section04Closing: TextContent = {
    paragraphs: [
      p(
        "The second one gets you something usable in 30 seconds. The first one gets you something generic that takes 10 more rounds of editing.",
      ),
    ],
  };
  const section04Prompt: ExampleCardContent = {
    label: "Try this exact prompt",
    intro: "Copy this into Claude as your first message:",
    promptBlock: {
      body: "Hi Claude. I work at Seven Generation Group — we run a communications agency (M2.0), a media monitoring company (Media Meter), and a data company (Rythmos DB). I'm just learning how to use you. Can you give me 5 examples of work tasks you could help me with — written in plain language, no jargon?",
    },
  };

  // ----- Logical 05: Using Claude safely -----
  const section05Intro: TextContent = {
    paragraphs: [
      p("This is the most important section of this module. Read it twice."),
      p(
        "Claude is a powerful tool, but anything you put into it leaves your screen. Before pasting any document, ask yourself: ",
        s("\"Would I email this to someone outside our group?\""),
        " If the answer is no, don't put it into Claude without checking with your manager or 7gen IT first.",
      ),
    ],
  };
  const section05Rules: ObjectivesBoxContent = {
    label: "The Three Always Rules",
    items: [
      "**Always** remove client names, NDA-protected details, and personal data (SSS, TIN, salaries) before pasting",
      "**Always** verify any fact, statistic, or quote Claude gives you before publishing — Claude can confidently make things up",
      "**Always** disclose AI assistance to your manager when the deliverable is client-facing or going to leadership",
    ],
  };
  const section05Closing: TextContent = {
    paragraphs: [
      p(
        "If you're unsure whether something is okay to share with Claude, the safe answer is: ",
        s("ask first, paste later"),
        ".",
      ),
    ],
  };

  // ----- Try It (mid-content callout, no numbered heading) -----
  const tryIt: TryItContent = {
    tag: "Practice",
    title: "Try it yourself — 10 minutes",
    intro: "Open Claude in a new tab and try this exercise:",
    steps: [
      'Send Claude the prompt from Section 04 (the "hi Claude" one)',
      "Read its 5 suggestions. Pick the one closest to your actual job.",
      "Ask Claude to walk you through how it would help you with that task",
      "Ask a follow-up question. Then another. See how the conversation builds.",
    ],
  };

  return [
    // 01
    {
      position: next(),
      number: "Section 01",
      title: "What you'll learn",
      type: SectionType.OBJECTIVES_BOX,
      content: section01,
    },
    // 02
    {
      position: next(),
      number: "Section 02",
      title: "So, what is Claude?",
      type: SectionType.TEXT,
      content: section02Text,
    },
    {
      position: next(),
      number: null,
      title: null,
      type: SectionType.COMPARISON,
      content: section02Comparison,
    },
    // 03
    {
      position: next(),
      number: "Section 03",
      title: "Accessing Claude at Seven Generation",
      type: SectionType.TEXT,
      content: section03Text,
    },
    {
      position: next(),
      number: null,
      title: null,
      type: SectionType.EXAMPLE_CARD,
      content: section03Checklist,
    },
    // 04
    {
      position: next(),
      number: "Section 04",
      title: "Your first real conversation",
      type: SectionType.TEXT,
      content: section04Intro,
    },
    {
      position: next(),
      number: null,
      title: null,
      type: SectionType.COMPARISON,
      content: section04Comparison,
    },
    {
      position: next(),
      number: null,
      title: null,
      type: SectionType.TEXT,
      content: section04Closing,
    },
    {
      position: next(),
      number: null,
      title: null,
      type: SectionType.EXAMPLE_CARD,
      content: section04Prompt,
    },
    // 05
    {
      position: next(),
      number: "Section 05",
      title: "Using Claude safely with company work",
      type: SectionType.TEXT,
      content: section05Intro,
    },
    {
      position: next(),
      number: null,
      title: null,
      type: SectionType.OBJECTIVES_BOX,
      content: section05Rules,
    },
    {
      position: next(),
      number: null,
      title: null,
      type: SectionType.TEXT,
      content: section05Closing,
    },
    // Try It (between Section 05 and Knowledge Check)
    {
      position: next(),
      number: null,
      title: null,
      type: SectionType.TRY_IT,
      content: tryIt,
    },
  ];
}

function module01Quizzes() {
  return [
    {
      position: 1,
      question:
        "A teammate asks Claude to summarize a confidential client contract. What's the right call?",
      options: [
        "Go ahead — Claude is private",
        "Send it as long as you delete the chat after",
        "Remove client names and confidential details first, or ask your manager",
        "Print it and read it yourself instead",
      ],
      correctIndex: 2,
      feedback:
        "Anything confidential needs review or redaction before going into Claude. Deleting a chat doesn't undo data already sent.",
    },
    {
      position: 2,
      question: "Which prompt will give you a better result?",
      options: [
        '"email apology"',
        '"Draft a 3-paragraph email apologizing to a client for a delayed deliverable, professional tone, offer a revised timeline"',
        '"write apology fast"',
        '"sorry email please"',
      ],
      correctIndex: 1,
      feedback:
        "Specificity — length, tone, audience, what to include — is what separates a useful response from a generic one.",
    },
    {
      position: 3,
      question:
        "Claude tells you a statistic about Philippine media consumption. You're about to put it in a client deck. What do you do?",
      options: [
        "Use it — Claude is trained on a lot of data",
        "Verify it from an original source before using it",
        "Ask Claude if it's sure",
        'Cite "Claude AI" as the source',
      ],
      correctIndex: 1,
      feedback:
        'Claude can confidently produce inaccurate facts (this is called "hallucination"). Statistics, quotes, and dates must always be verified from primary sources before publication.',
    },
  ];
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
