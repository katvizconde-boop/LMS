import Link from "next/link";
import { requireSession } from "@/lib/session";
import { db } from "@/lib/db";
import { getScopedReports } from "@/lib/manager";
import { TopBar } from "@/components/learner/TopBar";

export const metadata = { title: "Team — Seven Generation Learning" };

export default async function TeamPage() {
  const session = await requireSession();
  const reports = await getScopedReports(session.user.id, session.user.role);

  // Aggregate completion stats per user in one pass.
  const reportIds = reports.map((r) => r.id);
  const [enrollments, completions, pendingByUser] = await Promise.all([
    reportIds.length
      ? db.enrollment.findMany({
          where: { userId: { in: reportIds } },
          include: {
            program: {
              select: {
                id: true,
                title: true,
                slug: true,
                _count: { select: { modules: true } },
              },
            },
          },
        })
      : Promise.resolve([]),
    reportIds.length
      ? db.moduleProgress.findMany({
          where: { userId: { in: reportIds }, completedAt: { not: null } },
          select: { userId: true, module: { select: { programId: true } } },
        })
      : Promise.resolve([]),
    reportIds.length
      ? db.submission.groupBy({
          by: ["userId"],
          where: { userId: { in: reportIds }, status: "PENDING" },
          _count: { _all: true },
        })
      : Promise.resolve([]),
  ]);

  const enrollmentsByUser = new Map<string, typeof enrollments>();
  for (const e of enrollments) {
    const list = enrollmentsByUser.get(e.userId) ?? [];
    list.push(e);
    enrollmentsByUser.set(e.userId, list);
  }

  const completedCountByUserProgram = new Map<string, number>();
  for (const c of completions) {
    const key = `${c.userId}:${c.module.programId}`;
    completedCountByUserProgram.set(
      key,
      (completedCountByUserProgram.get(key) ?? 0) + 1,
    );
  }

  const pendingCountByUser = new Map<string, number>();
  for (const p of pendingByUser) pendingCountByUser.set(p.userId, p._count._all);

  const isAdmin = session.user.role === "ADMIN";

  return (
    <>
      <TopBar />
      <main className="flex-1">
        <header className="bg-navy text-cream">
          <div className="mx-auto max-w-[1100px] px-6 py-16 sm:px-8 sm:py-20">
            <div className="label-mono mb-6">
              {isAdmin ? "Admin / Team" : "Manager / Team"}
            </div>
            <h1 className="heading-serif text-4xl sm:text-6xl">
              {isAdmin ? "Everyone" : "Your team."}
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-cream/75">
              {isAdmin
                ? "All learners across Seven Generation. Click a name to see their submissions and progress."
                : "Your direct reports and where they are in their learning programs."}
            </p>
            <div className="mt-10 flex gap-6 border-t border-gold/30 pt-6">
              <Meta label="People" value={String(reports.length)} />
              <Meta
                label="Pending reviews"
                value={String(
                  Array.from(pendingCountByUser.values()).reduce((a, b) => a + b, 0),
                )}
              />
              <Link
                href="/reviews"
                className="ml-auto font-mono text-xs uppercase tracking-widest text-gold underline-offset-4 hover:underline"
              >
                Review queue →
              </Link>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-[1100px] px-6 py-16 sm:px-8">
          {reports.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="divide-y divide-line border-y border-line">
              {reports.map((u) => {
                const userEnrollments = enrollmentsByUser.get(u.id) ?? [];
                const totalModules = userEnrollments.reduce(
                  (a, e) => a + e.program._count.modules,
                  0,
                );
                const completedTotal = userEnrollments.reduce((a, e) => {
                  return (
                    a +
                    (completedCountByUserProgram.get(
                      `${u.id}:${e.programId}`,
                    ) ?? 0)
                  );
                }, 0);
                const pct =
                  totalModules === 0
                    ? 0
                    : Math.round((completedTotal / totalModules) * 100);
                const pending = pendingCountByUser.get(u.id) ?? 0;
                return (
                  <li key={u.id} className="py-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="min-w-0 flex-1">
                        <p className="heading-serif text-2xl text-navy">
                          {u.name ?? u.email}
                        </p>
                        <p className="mt-1 text-sm text-muted">{u.email}</p>
                        <div className="mt-2 flex flex-wrap gap-3 font-mono text-[10px] uppercase tracking-widest text-muted">
                          <span>{u.role.toLowerCase()}</span>
                          {u.entity ? <span>{u.entity.code}</span> : null}
                          {pending > 0 ? (
                            <span className="text-gold">
                              {pending} pending review
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex w-full flex-col gap-2 sm:w-64">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono uppercase tracking-widest text-muted">
                            {completedTotal}/{totalModules} modules
                          </span>
                          <span className="font-mono uppercase tracking-widest text-gold">
                            {pct}%
                          </span>
                        </div>
                        <div className="h-1 w-full overflow-hidden rounded-sm bg-cream-deep">
                          <div
                            className="h-full bg-gold transition-[width]"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-widest text-gold">
        {label}
      </span>
      <span className="text-base font-medium text-cream">{value}</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded border border-dashed border-line bg-cream-deep p-10 text-center">
      <div className="label-mono mb-3">No direct reports</div>
      <p className="heading-serif text-2xl text-navy">
        You don&rsquo;t have anyone reporting to you yet.
      </p>
      <p className="mt-3 text-sm text-muted">
        When HR assigns reports to your account they&rsquo;ll show up here.
      </p>
    </div>
  );
}
