import { requireSession } from "@/lib/session";
import { db } from "@/lib/db";
import { TopBar } from "@/components/learner/TopBar";
import { KudosButton } from "@/components/kudos/KudosButton";

export const metadata = { title: "Kudos — Seven Generation Learning" };

const PAGE_LIMIT = 30;

export default async function KudosPage() {
  const session = await requireSession();

  // All recent module completions across the org. Excludes the viewer's own
  // completions because you don't kudos yourself (those are shown separately).
  const recent = await db.moduleProgress.findMany({
    where: { completedAt: { not: null } },
    orderBy: { completedAt: "desc" },
    take: PAGE_LIMIT,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          department: true,
          entity: { select: { code: true } },
        },
      },
      module: {
        select: {
          id: true,
          number: true,
          title: true,
          program: { select: { slug: true, title: true } },
        },
      },
    },
  });

  // Pull kudos counts + whether the viewer already gave kudos for each completion.
  const pairs = recent.map((c) => ({ userId: c.userId, moduleId: c.moduleId }));
  const [kudosCounts, viewerKudos] = await Promise.all([
    pairs.length > 0
      ? db.kudos.groupBy({
          by: ["toUserId", "moduleId"],
          where: {
            OR: pairs.map((p) => ({
              toUserId: p.userId,
              moduleId: p.moduleId,
            })),
          },
          _count: { _all: true },
        })
      : Promise.resolve(
          [] as Array<{
            toUserId: string;
            moduleId: string;
            _count: { _all: number };
          }>,
        ),
    pairs.length > 0
      ? db.kudos.findMany({
          where: {
            fromUserId: session.user.id,
            OR: pairs.map((p) => ({
              toUserId: p.userId,
              moduleId: p.moduleId,
            })),
          },
          select: { toUserId: true, moduleId: true },
        })
      : Promise.resolve([] as Array<{ toUserId: string; moduleId: string }>),
  ]);

  const countMap = new Map<string, number>();
  for (const k of kudosCounts) {
    countMap.set(`${k.toUserId}:${k.moduleId}`, k._count._all);
  }
  const givenSet = new Set(
    viewerKudos.map((k) => `${k.toUserId}:${k.moduleId}`),
  );

  return (
    <>
      <TopBar />
      <main className="flex-1">
        <header className="bg-navy text-cream">
          <div className="mx-auto max-w-[1100px] px-6 py-16 sm:px-8 sm:py-20">
            <div className="label-mono mb-6">Kudos wall</div>
            <h1 className="heading-serif text-4xl sm:text-6xl">
              Recent finishes.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-cream/75">
              Every time someone finishes a module, it shows up here. Tap
              Congratulate to send them a quick 👏.
            </p>
          </div>
        </header>

        <section className="mx-auto max-w-[800px] px-6 py-12 sm:px-8">
          {recent.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="flex flex-col gap-4">
              {recent.map((c) => {
                const key = `${c.userId}:${c.moduleId}`;
                const count = countMap.get(key) ?? 0;
                const given = givenSet.has(key);
                const isSelf = c.userId === session.user.id;
                const completedDate = c.completedAt!.toLocaleDateString(
                  "en-US",
                  { month: "short", day: "numeric", year: "numeric" },
                );
                return (
                  <li key={c.id}>
                    <div className="card-soft p-5 sm:p-6">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="heading-serif text-xl text-navy">
                            {c.user.name ?? c.user.email}{" "}
                            {isSelf ? (
                              <span className="ml-1 font-mono text-[10px] uppercase tracking-widest text-muted">
                                you
                              </span>
                            ) : null}
                          </p>
                          <p className="mt-0.5 text-sm text-muted">
                            finished{" "}
                            <span className="text-navy font-medium">
                              Module {c.module.number} — {c.module.title}
                            </span>
                          </p>
                          <div className="mt-2 flex flex-wrap gap-3 font-mono text-[10px] uppercase tracking-widest text-muted">
                            <span>{completedDate}</span>
                            {c.user.entity ? (
                              <span>{c.user.entity.code}</span>
                            ) : null}
                            {c.user.department ? (
                              <span>{c.user.department}</span>
                            ) : null}
                            <span className="text-gold">
                              {c.module.program.title}
                            </span>
                          </div>
                        </div>
                        <KudosButton
                          recipientId={c.userId}
                          moduleId={c.moduleId}
                          initialGiven={given}
                          initialCount={count}
                          isSelf={isSelf}
                        />
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

function EmptyState() {
  return (
    <div className="card-soft p-10 text-center">
      <div className="label-mono mb-3">Nothing yet</div>
      <p className="heading-serif text-2xl text-navy">
        The first finisher will show up here.
      </p>
      <p className="mt-3 text-sm text-muted">
        Once someone clicks &ldquo;Mark Module Complete&rdquo; their finish
        appears on this wall, and you can send them a 👏.
      </p>
    </div>
  );
}
