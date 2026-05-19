import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { TopBar } from "@/components/learner/TopBar";

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

  const moduleIds = enrollments.flatMap((e) => e.program.modules.map((m) => m.id));
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
                return (
                  <Link
                    key={program.id}
                    href={`/programs/${program.slug}`}
                    className="group block rounded border border-line bg-white p-7 shadow-[0_2px_12px_rgba(26,35,50,0.04)] transition-shadow hover:shadow-[0_4px_20px_rgba(26,35,50,0.08)]"
                  >
                    <div className="label-mono mb-3">Program</div>
                    <h2 className="heading-serif text-3xl text-navy group-hover:text-navy-soft">
                      {program.title}
                    </h2>
                    {program.subtitle ? (
                      <p className="mt-3 text-sm text-muted">{program.subtitle}</p>
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
                );
              })}
            </div>
          )}
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
