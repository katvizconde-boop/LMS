import Link from "next/link";
import { requireSession } from "@/lib/session";
import { db } from "@/lib/db";
import { TopBar } from "@/components/learner/TopBar";
import { ArrowRight } from "lucide-react";

export const metadata = { title: "Programs — 7GEN LMS" };

export default async function ProgramsIndexPage() {
  const session = await requireSession();
  const userId = session.user.id;

  const enrollments = await db.enrollment.findMany({
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
  });

  const moduleIds = enrollments.flatMap((e) =>
    e.program.modules.map((m) => m.id),
  );
  const progress = moduleIds.length
    ? await db.moduleProgress.findMany({
        where: { userId, moduleId: { in: moduleIds }, completedAt: { not: null } },
        select: { moduleId: true },
      })
    : [];
  const completedSet = new Set(progress.map((p) => p.moduleId));

  return (
    <>
      <TopBar />
      <main className="flex-1 px-6 py-8 sm:px-8">
        <div className="mx-auto max-w-[1200px]">
          <header className="mb-8">
            <div className="label-mono mb-2">Your enrollments</div>
            <h1 className="heading-serif text-4xl text-navy sm:text-5xl">
              Programs
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              All the learning programs you&rsquo;re enrolled in. Pick one to
              continue.
            </p>
          </header>

          {enrollments.length === 0 ? (
            <div className="card-soft p-10 text-center">
              <div className="label-mono mb-3">No active programs</div>
              <p className="heading-serif text-2xl text-navy">
                You aren&rsquo;t enrolled in anything yet.
              </p>
              <p className="mt-3 text-sm text-muted">
                Your HR team will enroll you in a program when one starts.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {enrollments.map(({ program }) => {
                const total = program.modules.length;
                const done = program.modules.filter((m) =>
                  completedSet.has(m.id),
                ).length;
                const pct = total === 0 ? 0 : Math.round((done / total) * 100);
                const isComplete = total > 0 && done === total;
                return (
                  <Link
                    key={program.id}
                    href={`/programs/${program.slug}`}
                    className="card-soft card-soft-hover group flex flex-col p-6"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-coral-bg font-serif text-lg text-coral-deep">
                        {program.title
                          .split(" ")
                          .slice(-1)[0]
                          ?.slice(0, 2)
                          .toUpperCase()}
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
                        {isComplete ? "Complete" : done > 0 ? "Active" : "Start"}
                      </span>
                    </div>
                    <h2 className="mt-4 font-serif text-2xl text-navy group-hover:text-coral-deep">
                      {program.title}
                    </h2>
                    {program.subtitle ? (
                      <p className="mt-2 text-sm text-muted">
                        {program.subtitle}
                      </p>
                    ) : null}
                    <div className="mt-auto pt-6">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono uppercase tracking-widest text-muted">
                          {done}/{total} modules
                        </span>
                        <span className="font-mono uppercase tracking-widest text-coral-deep">
                          {pct}%
                        </span>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-line-cool">
                        <div
                          className="h-full rounded-full bg-coral transition-[width]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <div className="mt-5 flex items-center gap-2 text-sm font-medium text-coral-deep">
                      Continue <ArrowRight className="h-4 w-4" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
