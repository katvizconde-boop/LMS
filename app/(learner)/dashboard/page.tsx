import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { TopBar } from "@/components/learner/TopBar";
import { BookmarkCheck, Award } from "lucide-react";

export const metadata = { title: "Dashboard — Seven Generation Learning" };

export default async function DashboardPage() {
  const session = (await auth())!;
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
  const [progress, bookmarks] = await Promise.all([
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
  ]);
  const completedSet = new Set(progress.map((p) => p.moduleId));

  return (
    <>
      <TopBar />
      <main className="flex-1">
        <header className="bg-navy text-cream">
          <div className="mx-auto max-w-[1100px] px-6 py-16 sm:px-8 sm:py-24">
            <div className="label-mono mb-6">Your Dashboard</div>
            <h1 className="heading-serif text-4xl sm:text-6xl">
              Welcome,{" "}
              <em className="not-italic text-gold">
                {session.user.name?.split(" ")[0] ?? "there"}
              </em>
              .
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-cream/75">
              Your active learning programs are listed below. Pick one to keep
              going.
            </p>
          </div>
        </header>

        <section className="mx-auto max-w-[1100px] px-6 py-16 sm:px-8">
          {enrollments.length === 0 ? (
            <EmptyState />
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
                  <div
                    key={program.id}
                    className="group flex flex-col overflow-hidden rounded border border-line bg-white shadow-[0_2px_12px_rgba(26,35,50,0.04)] transition-shadow hover:shadow-[0_4px_20px_rgba(26,35,50,0.08)]"
                  >
                    <Link
                      href={`/programs/${program.slug}`}
                      className="flex-1 p-7"
                    >
                      <div className="label-mono mb-3">Program</div>
                      <h2 className="heading-serif text-3xl text-navy group-hover:text-navy-soft">
                        {program.title}
                      </h2>
                      {program.subtitle ? (
                        <p className="mt-3 text-sm text-muted">
                          {program.subtitle}
                        </p>
                      ) : null}

                      <div className="mt-6 flex items-center justify-between text-xs">
                        <span className="font-mono uppercase tracking-widest text-muted">
                          {done}/{total} modules
                        </span>
                        <span className="font-mono uppercase tracking-widest text-gold">
                          {pct}%
                        </span>
                      </div>
                      <div className="mt-2 h-1 w-full overflow-hidden rounded-sm bg-cream-deep">
                        <div
                          className="h-full bg-gold transition-[width]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </Link>

                    {isComplete ? (
                      <a
                        href={`/api/certificates/${program.id}/pdf`}
                        className="flex items-center gap-2 border-t border-success-border bg-success-bg px-5 py-3 text-xs transition-colors hover:bg-success-bg/70"
                      >
                        <Award className="h-3.5 w-3.5 text-success" />
                        <span className="font-mono uppercase tracking-widest text-success">
                          Certificate ready
                        </span>
                        <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-gold underline-offset-4 group-hover:underline">
                          Download →
                        </span>
                      </a>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}

          {bookmarks.length > 0 ? (
            <div className="mt-16">
              <div className="mb-4 flex items-center gap-2">
                <BookmarkCheck className="h-4 w-4 text-gold" />
                <h2 className="label-mono">Saved for later</h2>
              </div>
              <ul className="divide-y divide-line border-y border-line">
                {bookmarks.map((b) => (
                  <li key={b.id}>
                    <Link
                      href={`/programs/${b.module.program.slug}/modules/${b.module.position}`}
                      className="flex items-center justify-between py-4 transition-colors hover:bg-cream-deep/50"
                    >
                      <div className="min-w-0">
                        <p className="heading-serif text-xl text-navy">
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
          ) : null}
        </section>
      </main>
    </>
  );
}

function EmptyState() {
  return (
    <div className="rounded border border-dashed border-line bg-cream-deep p-10 text-center">
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
