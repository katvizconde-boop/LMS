import Link from "next/link";
import { requireSession } from "@/lib/session";
import { searchForUser } from "@/lib/search";
import { TopBar } from "@/components/learner/TopBar";

export const metadata = { title: "Search — Seven Generation Learning" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await requireSession();
  const { q = "" } = await searchParams;
  const trimmed = q.trim();
  const hits = trimmed
    ? await searchForUser(
        session.user.id,
        session.user.role === "ADMIN",
        trimmed,
      )
    : [];

  return (
    <>
      <TopBar />
      <main className="flex-1">
        <header className="bg-navy text-cream">
          <div className="mx-auto max-w-[1100px] px-6 py-12 sm:px-8 sm:py-16">
            <div className="label-mono mb-4">Search</div>
            <form
              action="/search"
              method="get"
              className="flex max-w-2xl gap-3"
            >
              <input
                type="search"
                name="q"
                autoFocus
                defaultValue={trimmed}
                placeholder="Search modules and content…"
                className="flex-1 rounded-sm border border-cream/30 bg-navy-soft px-4 py-3 text-base text-cream placeholder:text-cream/40 focus:border-gold focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-sm bg-gold px-5 py-3 font-mono text-xs uppercase tracking-widest text-navy hover:bg-cream"
              >
                Search
              </button>
            </form>
            <p className="mt-4 text-sm text-cream/60">
              {trimmed
                ? `${hits.length} ${
                    hits.length === 1 ? "result" : "results"
                  } for "${trimmed}"`
                : "Type a phrase to search across your enrolled programs."}
            </p>
          </div>
        </header>

        <section className="mx-auto max-w-[800px] px-6 py-12 sm:px-8">
          {!trimmed ? null : hits.length === 0 ? (
            <div className="rounded border border-dashed border-line bg-cream-deep p-10 text-center">
              <div className="label-mono mb-3">No matches</div>
              <p className="text-base text-navy-soft">
                Try a different word or shorter phrase.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-line border-y border-line">
              {hits.map((h) => (
                <li key={h.moduleId}>
                  <Link
                    href={`/programs/${h.program.slug}/modules/${h.position}`}
                    className="block py-5 transition-colors hover:bg-cream-deep/50"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="heading-serif text-xl text-navy">
                        Module {h.number} — {h.title}
                      </h3>
                      <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-gold">
                        {h.reason === "section_content"
                          ? "Content match"
                          : "Title match"}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted">
                      {h.program.title}
                    </p>
                    {h.excerpt ? (
                      <p className="mt-2 text-sm text-navy-soft">
                        {h.excerpt}
                      </p>
                    ) : h.subtitle ? (
                      <p className="mt-2 text-sm text-muted">{h.subtitle}</p>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
