import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ModuleForm } from "@/components/admin/ModuleForm";
import { ModuleDeleteButton } from "@/components/admin/ModuleDeleteButton";
import { SectionList } from "@/components/admin/SectionList";
import { QuizList } from "@/components/admin/QuizList";
import { ExerciseEditor } from "@/components/admin/ExerciseEditor";

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
            Sections · {mod.sections.length}
          </h2>
          <SectionList
            moduleId={mod.id}
            sections={mod.sections.map((s) => ({
              id: s.id,
              position: s.position,
              type: s.type,
              number: s.number,
              title: s.title,
              content: s.content,
            }))}
          />
        </div>

        <div>
          <h2 className="label-mono mb-3">
            Knowledge check · {mod.quizzes.length}{" "}
            {mod.quizzes.length === 1 ? "quiz" : "quizzes"}
          </h2>
          <QuizList
            moduleId={mod.id}
            quizzes={mod.quizzes.map((q) => ({
              id: q.id,
              position: q.position,
              question: q.question,
              options: q.options as string[],
              correctIndex: q.correctIndex,
              feedback: q.feedback,
            }))}
          />
        </div>

        <div>
          <h2 className="label-mono mb-3">
            Exercise {mod.exercise ? "" : "(none yet)"}
          </h2>
          <ExerciseEditor
            moduleId={mod.id}
            exercise={
              mod.exercise
                ? {
                    title: mod.exercise.title,
                    instructions: mod.exercise.instructions as {
                      intro?: string;
                      steps: string[];
                      deadlineNote?: string;
                    },
                    deadlineOffsetDays: mod.exercise.deadlineOffsetDays,
                  }
                : null
            }
          />
        </div>
      </section>
    </main>
  );
}
