import Link from "next/link";
import { db } from "@/lib/db";

export const metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const [
    userCount,
    programCount,
    activeProgramCount,
    enrollmentCount,
    moduleCount,
    completedModuleCount,
    submissionStats,
    programs,
    usersByRole,
    usersByEntity,
  ] = await Promise.all([
    db.user.count(),
    db.program.count(),
    db.program.count({ where: { archivedAt: null } }),
    db.enrollment.count(),
    db.module.count(),
    db.moduleProgress.count({ where: { completedAt: { not: null } } }),
    db.submission.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    db.program.findMany({
      where: { archivedAt: null },
      include: {
        _count: { select: { enrollments: true, modules: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.user.groupBy({ by: ["role"], _count: { _all: true } }),
    db.user.groupBy({
      by: ["entityId"],
      _count: { _all: true },
      orderBy: { _count: { id: "desc" } },
    }),
  ]);

  // Per-program completion: count completed modules / (enrollments * modules) per program.
  const perProgramCompletion = await Promise.all(
    programs.map(async (p) => {
      const completed = await db.moduleProgress.count({
        where: {
          completedAt: { not: null },
          module: { programId: p.id },
        },
      });
      const total = p._count.enrollments * p._count.modules;
      const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
      return { programId: p.id, completed, total, pct };
    }),
  );
  const perProgramMap = new Map(perProgramCompletion.map((x) => [x.programId, x]));

  const entityCodeMap = new Map(
    (
      await db.entity.findMany({ select: { id: true, code: true } })
    ).map((e) => [e.id, e.code]),
  );

  const pending =
    submissionStats.find((s) => s.status === "PENDING")?._count._all ?? 0;
  const approved =
    submissionStats.find((s) => s.status === "APPROVED")?._count._all ?? 0;
  const revision =
    submissionStats.find((s) => s.status === "REVISION_REQUESTED")?._count
      ._all ?? 0;

  return (
    <main className="flex-1">
      <header className="bg-navy text-cream">
        <div className="mx-auto max-w-[1100px] px-6 py-16 sm:px-8 sm:py-20">
          <div className="label-mono mb-6">Admin / Dashboard</div>
          <h1 className="heading-serif text-4xl sm:text-6xl">
            Seven Generation Learning.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-cream/75">
            Org-wide picture across all programs and entities.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-[1100px] px-6 py-12 sm:px-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Users" value={userCount} />
          <StatCard
            label="Active programs"
            value={activeProgramCount}
            sub={
              programCount > activeProgramCount
                ? `${programCount - activeProgramCount} archived`
                : undefined
            }
          />
          <StatCard label="Enrollments" value={enrollmentCount} />
          <StatCard
            label="Modules completed"
            value={completedModuleCount}
            sub={`of ${moduleCount * enrollmentCount} possible`}
          />
        </div>

        <div className="mt-12 grid gap-12 sm:grid-cols-2">
          <Panel title="Users by role">
            <BarList
              items={usersByRole.map((u) => ({
                label: u.role,
                value: u._count._all,
              }))}
              total={userCount}
            />
          </Panel>
          <Panel title="Users by entity">
            <BarList
              items={usersByEntity.map((u) => ({
                label: u.entityId
                  ? entityCodeMap.get(u.entityId) ?? "—"
                  : "(none)",
                value: u._count._all,
              }))}
              total={userCount}
            />
          </Panel>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Submissions · pending"
            value={pending}
            highlight={pending > 0}
          />
          <StatCard label="Submissions · approved" value={approved} />
          <StatCard label="Submissions · revision" value={revision} />
        </div>

        <div className="mt-12">
          <h2 className="label-mono mb-4">Per-program completion</h2>
          {programs.length === 0 ? (
            <p className="text-muted">No active programs yet.</p>
          ) : (
            <ul className="divide-y divide-line border-y border-line">
              {programs.map((p) => {
                const stats = perProgramMap.get(p.id);
                return (
                  <li key={p.id} className="py-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/admin/programs/${p.id}`}
                          className="heading-serif text-2xl text-navy hover:text-navy-soft"
                        >
                          {p.title}
                        </Link>
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted">
                          {p._count.enrollments} enrolled · {p._count.modules}{" "}
                          modules
                        </p>
                      </div>
                      <div className="flex w-full flex-col gap-2 sm:w-72">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono uppercase tracking-widest text-muted">
                            {stats?.completed ?? 0}/{stats?.total ?? 0}
                          </span>
                          <span className="font-mono uppercase tracking-widest text-gold">
                            {stats?.pct ?? 0}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-cream-deep">
                          <div
                            className="h-full rounded-full bg-gold transition-[width]"
                            style={{ width: `${stats?.pct ?? 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: number | string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        "card-soft p-5 " +
        (highlight ? "!border-gold/40 !bg-cream-deep" : "")
      }
    >
      <div className="label-mono mb-2">{label}</div>
      <div className="heading-serif text-3xl text-navy">{value}</div>
      {sub ? <div className="mt-1 text-xs text-muted">{sub}</div> : null}
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card-soft p-6">
      <div className="label-mono mb-4">{title}</div>
      {children}
    </div>
  );
}

function BarList({
  items,
  total,
}: {
  items: { label: string; value: number }[];
  total: number;
}) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((it) => {
        const pct = total === 0 ? 0 : Math.round((it.value / total) * 100);
        return (
          <li key={it.label}>
            <div className="mb-1 flex items-baseline justify-between text-sm">
              <span className="font-mono text-xs uppercase tracking-widest text-navy-soft">
                {it.label}
              </span>
              <span className="text-navy">
                {it.value}{" "}
                <span className="font-mono text-xs text-muted">
                  · {pct}%
                </span>
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-cream-deep">
              <div
                className="h-full rounded-full bg-gold"
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
