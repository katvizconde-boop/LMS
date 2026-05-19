import Link from "next/link";
import { db } from "@/lib/db";

export const metadata = { title: "Export — Admin" };

export default async function ExportPage() {
  const programs = await db.program.findMany({
    where: { archivedAt: null },
    orderBy: { title: "asc" },
    select: {
      id: true,
      slug: true,
      title: true,
      _count: { select: { enrollments: true, modules: true } },
    },
  });

  return (
    <main className="flex-1">
      <header className="bg-navy text-cream">
        <div className="mx-auto max-w-[1100px] px-6 py-16 sm:px-8 sm:py-20">
          <div className="label-mono mb-6">Admin / Export</div>
          <h1 className="heading-serif text-4xl sm:text-6xl">
            Completion reports.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-cream/75">
            Download CSVs for HR records and stakeholder reporting.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-[1100px] px-6 py-12 sm:px-8">
        <h2 className="label-mono mb-4">Per-program completion (CSV)</h2>
        <p className="mb-6 text-base text-navy-soft">
          One row per (learner × module) — includes user info, entity, status,
          completion timestamp, and latest submission state. Opens directly in
          Excel or Google Sheets.
        </p>

        <ul className="divide-y divide-line border-y border-line">
          {programs.map((p) => (
            <li key={p.id} className="flex items-center justify-between py-5">
              <div>
                <p className="heading-serif text-2xl text-navy">{p.title}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted">
                  {p._count.enrollments} learners · {p._count.modules} modules
                </p>
              </div>
              <Link
                href={`/api/admin/export/completions.csv?program=${p.slug}`}
                className="rounded-sm bg-gold px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-navy transition-colors hover:bg-navy hover:text-gold"
                download
              >
                Download CSV
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-12 rounded border border-dashed border-line bg-cream-deep p-6">
          <div className="label-mono mb-2">All programs combined</div>
          <p className="mb-4 text-sm text-navy-soft">
            Single CSV containing every program. Useful for org-wide reporting.
          </p>
          <Link
            href="/api/admin/export/completions.csv"
            className="rounded-sm bg-navy px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-cream hover:bg-navy-soft"
            download
          >
            Download all
          </Link>
        </div>
      </section>
    </main>
  );
}
