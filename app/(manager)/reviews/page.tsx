import { requireSession } from "@/lib/session";
import { getReviewableSubmissions } from "@/lib/manager";
import { TopBar } from "@/components/learner/TopBar";
import { ReviewCard } from "@/components/manager/ReviewCard";

export const metadata = { title: "Reviews — 7GEN LMS" };

export default async function ReviewsPage() {
  const session = await requireSession();
  const submissions = await getReviewableSubmissions(
    session.user.id,
    session.user.role,
    { statuses: ["PENDING"] },
  );

  return (
    <>
      <TopBar />
      <main className="flex-1">
        <header className="bg-navy text-cream">
          <div className="mx-auto max-w-[1100px] px-6 py-16 sm:px-8 sm:py-20">
            <div className="label-mono mb-6">Review queue</div>
            <h1 className="heading-serif text-4xl sm:text-6xl">
              Submissions to review.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-cream/75">
              {submissions.length === 0
                ? "No pending submissions right now. Nice work."
                : `${submissions.length} submission${submissions.length === 1 ? "" : "s"} waiting on you.`}
            </p>
          </div>
        </header>

        <section className="mx-auto max-w-[800px] px-6 py-16 sm:px-8">
          {submissions.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="flex flex-col gap-6">
              {submissions.map((s) => (
                <li key={s.id}>
                  <ReviewCard
                    submission={{
                      id: s.id,
                      content: s.content,
                      submittedAt: s.submittedAt.toISOString(),
                      user: {
                        name: s.user.name,
                        email: s.user.email,
                        entity: s.user.entity
                          ? { code: s.user.entity.code }
                          : null,
                      },
                      module: {
                        number: s.module.number,
                        title: s.module.title,
                        program: {
                          slug: s.module.program.slug,
                          title: s.module.program.title,
                        },
                      },
                    }}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}

function EmptyState() {
  return (
    <div className="rounded border border-dashed border-line bg-cream-deep p-10 text-center">
      <div className="label-mono mb-3">All caught up</div>
      <p className="heading-serif text-2xl text-navy">
        Nothing in the queue.
      </p>
      <p className="mt-3 text-sm text-muted">
        When your team members submit module exercises they&rsquo;ll appear here.
      </p>
    </div>
  );
}
