import Link from "next/link";
import { db } from "@/lib/db";

export const metadata = { title: "Programs — Admin" };

export default async function AdminProgramsPage() {
  const programs = await db.program.findMany({
    include: {
      _count: { select: { modules: true, enrollments: true } },
      owner: { select: { name: true, email: true } },
    },
    orderBy: [{ archivedAt: "asc" }, { createdAt: "desc" }],
  });

  return (
    <main className="flex-1">
      <header className="bg-navy text-cream">
        <div className="mx-auto max-w-[1100px] px-6 py-16 sm:px-8 sm:py-20">
          <div className="label-mono mb-6">Admin / Programs</div>
          <h1 className="heading-serif text-4xl sm:text-6xl">Programs.</h1>
          <p className="mt-6 max-w-2xl text-lg text-cream/75">
            Create and manage L&amp;D programs. Each program holds its own
            modules, audience, and timeline.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-[1100px] px-6 py-12 sm:px-8">
        <div className="mb-6 flex items-center justify-between">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            {programs.length} total · {programs.filter((p) => !p.archivedAt).length} active
          </p>
          <Link
            href="/admin/programs/new"
            className="rounded-sm bg-gold px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-navy hover:bg-navy hover:text-gold"
          >
            + New program
          </Link>
        </div>

        <ul className="divide-y divide-line border-y border-line">
          {programs.map((p) => (
            <li key={p.id}>
              <Link
                href={`/admin/programs/${p.id}`}
                className="block py-5 transition-colors hover:bg-cream-deep/50"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="heading-serif text-2xl text-navy">
                      {p.title}
                      {p.archivedAt ? (
                        <span className="ml-3 font-mono text-[10px] uppercase tracking-widest text-muted">
                          archived
                        </span>
                      ) : null}
                    </h2>
                    {p.subtitle ? (
                      <p className="mt-1 text-sm text-muted">{p.subtitle}</p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap gap-4 font-mono text-[10px] uppercase tracking-widest text-muted">
                      <span>{p.slug}</span>
                      <span>{p._count.modules} modules</span>
                      <span>{p._count.enrollments} enrolled</span>
                      <span>owner: {p.owner.name ?? p.owner.email}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
