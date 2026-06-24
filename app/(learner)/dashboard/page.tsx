import Link from "next/link";
import { requireSession } from "@/lib/session";
import { db } from "@/lib/db";
import { TopBar } from "@/components/learner/TopBar";
import { KudosWall } from "@/components/learner/KudosWall";
import { BookmarkCheck, Award, ArrowRight } from "lucide-react";

export const metadata = { title: "Dashboard — 7GEN LMS" };

export default async function DashboardPage() {
  const session = await requireSession();
  const userId = session.user.id;

  const [me, enrollments] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        role: true,
        entity: { select: { name: true, code: true } },
      },
    }),
    db.enrollment.findMany({
      where: { userId },
      include: {
        program: {
          include: {
            modules: {
              select: { id: true, position: true },
              orderBy: { position: "asc" },
            },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    }),
  ]);

  const moduleIds = enrollments.flatMap((e) =>
    e.program.modules.map((m) => m.id),
  );
  const [progress, bookmarks, recentFinishes, myKudos] = await Promise.all([
    moduleIds.length
      ? db.moduleProgress.findMany({
          where: { userId, moduleId: { in: moduleIds }, completedAt: { not: null } },
          select: { moduleId: true },
        })
      : Promise.resolve([] as { moduleId: string }[]),
    db.bookmark.findMany({
      where: { userId },
      include: {
        module: {
          include: { program: { select: { slug: true, title: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.moduleProgress.findMany({
      where: { completedAt: { not: null } },
      orderBy: { completedAt: "desc" },
      take: 12,
      include: {
        user: {
          select: { id: true, name: true, email: true, department: true },
        },
        module: {
          select: {
            id: true,
            number: true,
            title: true,
            program: { select: { title: true } },
          },
        },
      },
    }),
    db.kudos.findMany({
      select: { toUserId: true, moduleId: true, fromUserId: true },
    }),
  ]);
  const completedSet = new Set(progress.map((p) => p.moduleId));

  const kudosCountMap = new Map<string, number>();
  const iKudosedSet = new Set<string>();
  for (const k of myKudos) {
    const key = `${k.toUserId}:${k.moduleId}`;
    kudosCountMap.set(key, (kudosCountMap.get(key) ?? 0) + 1);
    if (k.fromUserId === userId) iKudosedSet.add(key);
  }

  const finishes = recentFinishes.map((p) => {
    const key = `${p.userId}:${p.moduleId}`;
    return {
      userId: p.userId,
      userName: p.user.name,
      userEmail: p.user.email,
      userDepartment: p.user.department,
      moduleId: p.moduleId,
      moduleNumber: p.module.number,
      moduleTitle: p.module.title,
      programTitle: p.module.program.title,
      completedAt: p.completedAt!.toISOString(),
      kudosCount: kudosCountMap.get(key) ?? 0,
      iKudosed: iKudosedSet.has(key),
      isSelf: p.userId === userId,
    };
  });

  // Aggregate stats for top cards
  const totalModules = enrollments.reduce(
    (sum, e) => sum + e.program.modules.length,
    0,
  );
  const completedCount = progress.length;
  const overallPct =
    totalModules === 0 ? 0 : Math.round((completedCount / totalModules) * 100);
  const activePrograms = enrollments.length;

  const firstName = (me?.name ?? me?.email ?? "there").split(/[\s@.]+/)[0];

  return (
    <>
      <TopBar />
      <main className="flex-1 px-6 py-8 sm:px-8">
        <div className="mx-auto max-w-[1200px]">
          {/* Greeting */}
          <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="label-mono mb-2">Your dashboard</div>
              <h1 className="heading-serif text-4xl text-navy sm:text-5xl">
                Welcome back,{" "}
                <em className="not-italic text-coral-deep">{firstName}</em>.
              </h1>
              <p className="mt-2 text-sm text-muted">
                Your active learning programs and progress at a glance.
              </p>
            </div>
            <Link href="/programs" className="btn-pill btn-primary">
              Browse programs <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </header>

          {/* Top row: Profile + Performance/Activity */}
          <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
            <ProfileCard me={me} />
            <div className="grid gap-6 sm:grid-cols-2">
              <StatCard
                label="Overall progress"
                value={`${overallPct}%`}
                sub={`${completedCount} / ${totalModules} modules done`}
                accent="coral"
              >
                <ProgressBar pct={overallPct} />
              </StatCard>
              <StatCard
                label="Active programs"
                value={String(activePrograms)}
                sub="Pilots running June 2026"
                accent="cream"
              >
                <ProgramSpark count={activePrograms} />
              </StatCard>
            </div>
          </div>

          {/* Programs table */}
          <section className="mt-10">
            <div className="card-soft overflow-hidden">
              <div className="flex items-center justify-between border-b border-line-cool px-6 py-4">
                <h2 className="font-serif text-xl text-navy">Your programs</h2>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                  {enrollments.length} active
                </span>
              </div>
              {enrollments.length === 0 ? (
                <EmptyState />
              ) : (
                <ul className="divide-y divide-line-cool">
                  {enrollments.map(({ program }) => {
                    const total = program.modules.length;
                    const done = program.modules.filter((m) =>
                      completedSet.has(m.id),
                    ).length;
                    const pct =
                      total === 0 ? 0 : Math.round((done / total) * 100);
                    const isComplete = total > 0 && done === total;
                    return (
                      <li key={program.id}>
                        <Link
                          href={`/programs/${program.slug}`}
                          className="group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-coral-bg/40"
                        >
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-coral-bg font-serif text-lg text-coral-deep">
                            {program.title
                              .split(" ")
                              .slice(-1)[0]
                              ?.slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-serif text-lg text-navy group-hover:text-coral-deep">
                              {program.title}
                            </p>
                            {program.subtitle ? (
                              <p className="truncate text-xs text-muted">
                                {program.subtitle}
                              </p>
                            ) : null}
                          </div>
                          <div className="hidden w-32 shrink-0 text-right sm:block">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                              Modules
                            </p>
                            <p className="text-sm font-semibold text-navy">
                              {done}/{total}
                            </p>
                          </div>
                          <div className="hidden w-40 shrink-0 sm:block">
                            <ProgressBar pct={pct} />
                            <p className="mt-1 text-right font-mono text-[10px] uppercase tracking-widest text-muted">
                              {pct}%
                            </p>
                          </div>
                          <span
                            className={`status-pill ${
                              isComplete
                                ? "status-done"
                                : done > 0
                                  ? "status-active"
                                  : "status-locked"
                            }`}
                          >
                            {isComplete
                              ? "Complete"
                              : done > 0
                                ? "Active"
                                : "Start"}
                          </span>
                        </Link>
                        {isComplete ? (
                          <a
                            href={`/api/certificates/${program.id}/pdf`}
                            className="flex items-center gap-2 border-t border-success-border bg-success-bg px-6 py-2.5 text-xs hover:bg-success-bg/70"
                          >
                            <Award className="h-3.5 w-3.5 text-success" />
                            <span className="font-mono uppercase tracking-widest text-success">
                              Certificate ready
                            </span>
                            <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-coral-deep">
                              Download →
                            </span>
                          </a>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>

          {/* Kudos as feedback cards */}
          <section className="mt-10">
            <KudosWall finishes={finishes} />
          </section>

          {bookmarks.length > 0 ? (
            <section className="mt-10">
              <div className="card-soft p-6">
                <div className="mb-4 flex items-center gap-2">
                  <BookmarkCheck className="h-4 w-4 text-coral-deep" />
                  <h2 className="label-mono">Saved for later</h2>
                </div>
                <ul className="divide-y divide-line-cool">
                  {bookmarks.map((b) => (
                    <li key={b.id}>
                      <Link
                        href={`/programs/${b.module.program.slug}/modules/${b.module.position}`}
                        className="flex items-center justify-between py-3 transition-colors hover:text-coral-deep"
                      >
                        <div className="min-w-0">
                          <p className="font-serif text-lg text-navy">
                            Module {b.module.number} — {b.module.title}
                          </p>
                          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-muted">
                            {b.module.program.title}
                          </p>
                        </div>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                          Saved{" "}
                          {b.createdAt.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ) : null}
        </div>
      </main>
    </>
  );
}

function ProfileCard({
  me,
}: {
  me: {
    name: string | null;
    email: string;
    department: string | null;
    role: string;
    entity: { name: string; code: string } | null;
  } | null;
}) {
  if (!me) return null;
  const display = me.name ?? me.email;
  const roleLabel = me.role === "ADMIN" ? "Admin" : "Learner";
  return (
    <div className="card-soft overflow-hidden">
      <div className="h-20 bg-gradient-to-br from-coral via-coral-soft to-coral-bg" />
      <div className="-mt-10 flex flex-col items-center px-6 pb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-surface bg-coral text-2xl font-semibold text-white">
          {initials(display)}
        </div>
        <p className="mt-3 font-serif text-xl text-navy">{display}</p>
        <span className="status-pill status-active mt-2">{roleLabel}</span>
        <div className="mt-5 w-full space-y-2 text-xs">
          <Row label="Email" value={me.email} />
          <Row label="Team" value={me.department ?? "—"} />
          <Row label="Entity" value={me.entity?.name ?? "—"} />
        </div>
        <Link
          href="/profile"
          className="btn-pill btn-secondary mt-5 w-full"
        >
          Edit profile
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-surface-alt px-3 py-2">
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
        {label}
      </span>
      <span className="min-w-0 truncate text-right text-xs font-medium text-navy">
        {value}
      </span>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent,
  children,
}: {
  label: string;
  value: string;
  sub: string;
  accent: "coral" | "cream";
  children?: React.ReactNode;
}) {
  return (
    <div className="card-soft flex flex-col p-6">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
          {label}
        </span>
        <span
          className={`status-pill ${
            accent === "coral" ? "status-active" : "status-done"
          }`}
        >
          This pilot
        </span>
      </div>
      <p className="mt-3 font-serif text-4xl text-navy">{value}</p>
      <p className="mt-1 text-xs text-muted">{sub}</p>
      <div className="mt-auto pt-4">{children}</div>
    </div>
  );
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-line-cool">
      <div
        className="h-full rounded-full bg-coral transition-[width]"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function ProgramSpark({ count }: { count: number }) {
  // Tiny faux-chart row matching the spacing in the screenshot
  const bars = Array.from({ length: Math.max(count, 4) });
  return (
    <div className="flex h-12 items-end gap-1.5">
      {bars.map((_, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-md"
          style={{
            height: `${30 + ((i * 17) % 70)}%`,
            background: i < count ? "var(--color-coral)" : "var(--color-coral-soft)",
          }}
        />
      ))}
    </div>
  );
}

function initials(s: string) {
  return s
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0]?.toUpperCase())
    .join("");
}

function EmptyState() {
  return (
    <div className="p-10 text-center">
      <div className="label-mono mb-3">No active programs</div>
      <p className="heading-serif text-2xl text-navy">
        You aren&rsquo;t enrolled in anything yet.
      </p>
      <p className="mt-3 text-sm text-muted">
        Your HR team will enroll you in a program when one starts. Hang tight.
      </p>
    </div>
  );
}
