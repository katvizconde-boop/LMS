import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const programSlug = url.searchParams.get("program");

  const programFilter = programSlug ? { slug: programSlug } : { archivedAt: null };

  const programs = await db.program.findMany({
    where: programFilter,
    include: {
      modules: { orderBy: { position: "asc" } },
      enrollments: {
        include: {
          user: { include: { entity: { select: { code: true } } } },
        },
      },
    },
    orderBy: { title: "asc" },
  });

  if (programs.length === 0) {
    return new NextResponse("Program not found", { status: 404 });
  }

  // Collect (user, module) pairs to query progress + submissions.
  const moduleIds = programs.flatMap((p) => p.modules.map((m) => m.id));
  const userIds = Array.from(
    new Set(programs.flatMap((p) => p.enrollments.map((e) => e.userId))),
  );

  const [progressRows, latestSubmissions] = await Promise.all([
    db.moduleProgress.findMany({
      where: { moduleId: { in: moduleIds }, userId: { in: userIds } },
      select: {
        userId: true,
        moduleId: true,
        startedAt: true,
        completedAt: true,
      },
    }),
    db.submission.findMany({
      where: { moduleId: { in: moduleIds }, userId: { in: userIds } },
      orderBy: { submittedAt: "desc" },
      select: {
        userId: true,
        moduleId: true,
        status: true,
        submittedAt: true,
      },
    }),
  ]);

  const progressKey = (u: string, m: string) => `${u}:${m}`;
  const progressMap = new Map(
    progressRows.map((p) => [progressKey(p.userId, p.moduleId), p]),
  );

  // Map (user,module) -> first (most recent) submission seen.
  const submissionMap = new Map<
    string,
    { status: string; submittedAt: Date }
  >();
  for (const s of latestSubmissions) {
    const k = progressKey(s.userId, s.moduleId);
    if (!submissionMap.has(k)) submissionMap.set(k, s);
  }

  const headers = [
    "program_slug",
    "program_title",
    "module_number",
    "module_title",
    "user_email",
    "user_name",
    "user_role",
    "entity",
    "enrolled_at",
    "started_at",
    "completed_at",
    "latest_submission_status",
    "latest_submission_at",
  ];

  const lines: string[] = [headers.join(",")];

  for (const p of programs) {
    for (const e of p.enrollments) {
      const user = e.user;
      for (const m of p.modules) {
        const prog = progressMap.get(progressKey(user.id, m.id));
        const sub = submissionMap.get(progressKey(user.id, m.id));
        lines.push(
          [
            p.slug,
            p.title,
            m.number,
            m.title,
            user.email,
            user.name ?? "",
            user.role,
            user.entity?.code ?? "",
            e.enrolledAt.toISOString(),
            prog?.startedAt?.toISOString() ?? "",
            prog?.completedAt?.toISOString() ?? "",
            sub?.status ?? "",
            sub?.submittedAt?.toISOString() ?? "",
          ]
            .map(csvEscape)
            .join(","),
        );
      }
    }
  }

  const filename = programSlug
    ? `completions-${programSlug}-${stampedDate()}.csv`
    : `completions-all-${stampedDate()}.csv`;

  return new NextResponse(lines.join("\n") + "\n", {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

function csvEscape(value: string): string {
  if (value === null || value === undefined) return "";
  const needsQuoting = /[",\n\r]/.test(value);
  if (!needsQuoting) return value;
  return `"${value.replace(/"/g, '""')}"`;
}

function stampedDate(): string {
  return new Date().toISOString().slice(0, 10);
}
