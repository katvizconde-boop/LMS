import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProgramForm } from "@/components/admin/ProgramForm";
import { ProgramArchiveButton } from "@/components/admin/ProgramArchiveButton";
import { EnrollmentManager } from "@/components/admin/EnrollmentManager";

type Params = { id: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const program = await db.program.findUnique({
    where: { id },
    select: { title: true },
  });
  return { title: program ? `${program.title} — Admin` : "Program — Admin" };
}

export default async function AdminProgramDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const program = await db.program.findUnique({
    where: { id },
    include: {
      modules: { orderBy: { position: "asc" } },
      enrollments: {
        include: {
          user: {
            include: { entity: { select: { code: true } } },
          },
        },
        orderBy: { enrolledAt: "asc" },
      },
    },
  });
  if (!program) notFound();

  const enrolledUserIds = new Set(program.enrollments.map((e) => e.userId));
  const [availableUsers, entities] = await Promise.all([
    db.user.findMany({
      where: { id: { notIn: Array.from(enrolledUserIds) } },
      include: { entity: { select: { code: true } } },
      orderBy: [{ role: "asc" }, { name: "asc" }],
    }),
    db.entity.findMany({
      select: { id: true, code: true },
      orderBy: { code: "asc" },
    }),
  ]);

  return (
    <main className="flex-1">
      <header className="bg-navy text-cream">
        <div className="mx-auto max-w-[1100px] px-6 py-12 sm:px-8">
          <div className="label-mono mb-4">
            <Link href="/admin/programs" className="text-cream/60 hover:text-gold">
              ← Programs
            </Link>
            <span className="mx-2">/</span>
            <span className="font-mono">{program.slug}</span>
            {program.archivedAt ? (
              <span className="ml-3 rounded-sm border border-cream/30 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-cream/70">
                archived
              </span>
            ) : null}
          </div>
          <h1 className="heading-serif text-4xl sm:text-5xl">{program.title}</h1>
          {program.subtitle ? (
            <p className="mt-4 max-w-2xl text-lg text-cream/75">
              {program.subtitle}
            </p>
          ) : null}
        </div>
      </header>

      <section className="mx-auto max-w-[1100px] px-6 py-12 sm:px-8">
        <div className="grid gap-12">
          {/* Edit form */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="label-mono">Program details</h2>
              <ProgramArchiveButton
                programId={program.id}
                archived={!!program.archivedAt}
              />
            </div>
            <ProgramForm
              mode="edit"
              program={{
                id: program.id,
                title: program.title,
                slug: program.slug,
                subtitle: program.subtitle,
                description: program.description,
                startDate: program.startDate,
                endDate: program.endDate,
              }}
            />
          </div>

          {/* Modules */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="label-mono">Modules · {program.modules.length}</h2>
              <Link
                href={`/admin/programs/${program.id}/modules/new`}
                className="rounded-sm bg-gold px-4 py-2 font-mono text-xs uppercase tracking-widest text-navy hover:bg-navy hover:text-gold"
              >
                + New module
              </Link>
            </div>
            {program.modules.length === 0 ? (
              <p className="rounded border border-dashed border-line bg-cream-deep p-6 text-center text-sm text-muted">
                No modules yet.
              </p>
            ) : (
              <ul className="divide-y divide-line border-y border-line">
                {program.modules.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center justify-between py-4"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/admin/programs/${program.id}/modules/${m.id}`}
                        className="heading-serif text-xl text-navy hover:text-navy-soft"
                      >
                        Module {m.number} — {m.title}
                      </Link>
                      <div className="mt-1 flex flex-wrap gap-4 font-mono text-[10px] uppercase tracking-widest text-muted">
                        <span>{m.level.toLowerCase()}</span>
                        {m.durationMinutes ? (
                          <span>{m.durationMinutes} min</span>
                        ) : null}
                        {m.availableFrom ? (
                          <span>
                            available{" "}
                            {m.availableFrom.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        ) : (
                          <span>unscheduled</span>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/admin/programs/${program.id}/modules/${m.id}`}
                      className="font-mono text-[11px] uppercase tracking-widest text-gold underline-offset-4 hover:underline"
                    >
                      Edit →
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Enrollments */}
          <div>
            <h2 className="label-mono mb-3">Enrollments</h2>
            <EnrollmentManager
              programId={program.id}
              enrolled={program.enrollments.map((e) => ({
                userId: e.userId,
                enrolledAt: e.enrolledAt.toISOString(),
                user: {
                  id: e.user.id,
                  name: e.user.name,
                  email: e.user.email,
                  role: e.user.role,
                  entity: e.user.entity ? { code: e.user.entity.code } : null,
                },
              }))}
              availableUsers={availableUsers.map((u) => ({
                id: u.id,
                name: u.name,
                email: u.email,
                role: u.role,
                entity: u.entity ? { code: u.entity.code } : null,
              }))}
              entities={entities}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
