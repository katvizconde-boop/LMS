import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ModuleForm } from "@/components/admin/ModuleForm";
import { ModuleDeleteButton } from "@/components/admin/ModuleDeleteButton";

type Params = { id: string; mid: string };

export const metadata = { title: "Edit module — Admin" };

export default async function EditModulePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id, mid } = await params;

  const [program, mod] = await Promise.all([
    db.program.findUnique({
      where: { id },
      select: { id: true, title: true, slug: true },
    }),
    db.module.findUnique({
      where: { id: mid },
      include: {
        sections: { orderBy: { position: "asc" } },
        quizzes: { orderBy: { position: "asc" } },
        exercise: true,
      },
    }),
  ]);

  if (!program || !mod || mod.programId !== program.id) notFound();

  return (
    <main className="flex-1">
      <header className="bg-navy text-cream">
        <div className="mx-auto max-w-[1100px] px-6 py-12 sm:px-8">
          <div className="label-mono mb-4">
            <Link
              href={`/admin/programs/${program.id}`}
              className="text-cream/60 hover:text-gold"
            >
              ← {program.title}
            </Link>
            <span className="mx-2">/</span>
            <span>Module {mod.number}</span>
          </div>
          <h1 className="heading-serif text-4xl sm:text-5xl">
            {mod.title}
          </h1>
        </div>
      </header>

      <section className="mx-auto max-w-[1100px] px-6 py-12 sm:px-8 flex flex-col gap-12">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="label-mono">Module metadata</h2>
            <div className="flex items-center gap-3">
              <Link
                href={`/programs/${program.slug}/modules/${mod.position}`}
                target="_blank"
                className="font-mono text-[11px] uppercase tracking-widest text-gold underline-offset-4 hover:underline"
              >
                Preview ↗
              </Link>
              <ModuleDeleteButton moduleId={mod.id} />
            </div>
          </div>
          <ModuleForm mode="edit" programId={program.id} mod={mod} />
        </div>

        <div>
          <h2 className="label-mono mb-3">
            Content · {mod.sections.length} sections, {mod.quizzes.length}{" "}
            quizzes, {mod.exercise ? "1 exercise" : "no exercise"}
          </h2>
          <div className="rounded border border-dashed border-line bg-cream-deep p-6">
            <p className="text-sm text-navy-soft">
              The per-block section composer (TEXT / OBJECTIVES_BOX / COMPARISON
              / TRY_IT / etc.) ships in <strong>Phase 4.5</strong>. For now,
              edit section content, quizzes, and the exercise directly in
              Prisma Studio:
            </p>
            <pre className="mt-3 inline-block rounded-sm border border-line bg-white px-3 py-1.5 font-mono text-xs text-navy">
              npm run db:studio
            </pre>
            {mod.sections.length > 0 ? (
              <ul className="mt-5 flex flex-col gap-1.5 text-sm">
                {mod.sections.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between border-b border-line/60 pb-1.5"
                  >
                    <span>
                      <span className="font-mono text-xs text-muted">
                        #{s.position}
                      </span>{" "}
                      <span className="font-mono text-xs text-gold">
                        {s.type}
                      </span>{" "}
                      {s.title ?? s.number ?? ""}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
