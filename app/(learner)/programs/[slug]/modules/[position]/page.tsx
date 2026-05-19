import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { TopBar } from "@/components/learner/TopBar";
import { ModuleHero } from "@/components/module/ModuleHero";
import {
  SectionGroup,
  groupSections,
} from "@/components/module/SectionRenderer";
import { KnowledgeCheckSection } from "@/components/module/KnowledgeCheckSection";
import { ExerciseSection } from "@/components/module/ExerciseSection";
import { CompleteSection } from "@/components/module/CompleteSection";
import { NextModule } from "@/components/module/NextModule";

type Params = { slug: string; position: string };

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug, position } = await params;
  const program = await db.program.findUnique({ where: { slug }, select: { id: true } });
  if (!program) return { title: "Module" };
  const mod = await db.module.findUnique({
    where: { programId_position: { programId: program.id, position: Number(position) } },
    select: { number: true, title: true },
  });
  if (!mod) return { title: "Module" };
  return { title: `Module ${mod.number} — ${mod.title}` };
}

export default async function ModulePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const session = (await auth())!;
  const { slug, position: positionRaw } = await params;
  const position = Number(positionRaw);
  if (!Number.isFinite(position)) notFound();

  const program = await db.program.findUnique({
    where: { slug },
    include: {
      enrollments: { where: { userId: session.user.id }, select: { id: true } },
    },
  });
  if (!program) notFound();
  if (program.enrollments.length === 0) redirect("/dashboard");

  const mod = await db.module.findUnique({
    where: { programId_position: { programId: program.id, position } },
    include: {
      sections: { orderBy: { position: "asc" } },
      quizzes: { orderBy: { position: "asc" } },
      exercise: true,
    },
  });
  if (!mod) notFound();

  // Lock check — admins can preview locked modules.
  const isLocked = !!(mod.availableFrom && mod.availableFrom > new Date());
  if (isLocked && session.user.role !== "ADMIN") {
    redirect(`/programs/${slug}`);
  }

  const next = await db.module.findFirst({
    where: { programId: program.id, position: { gt: position } },
    orderBy: { position: "asc" },
    select: {
      number: true,
      title: true,
      subtitle: true,
      heroSubtitle: true,
      availableFrom: true,
    },
  });

  // Hydration data for client interactions.
  const [quizAnswers, moduleProgress, latestSubmission] = await Promise.all([
    mod.quizzes.length > 0
      ? db.quizAnswer.findMany({
          where: {
            userId: session.user.id,
            quizId: { in: mod.quizzes.map((q) => q.id) },
          },
          select: { quizId: true, choiceIndex: true },
        })
      : Promise.resolve([] as { quizId: string; choiceIndex: number }[]),
    db.moduleProgress.findUnique({
      where: { userId_moduleId: { userId: session.user.id, moduleId: mod.id } },
      select: { completedAt: true },
    }),
    mod.exercise
      ? db.submission.findFirst({
          where: { userId: session.user.id, moduleId: mod.id },
          orderBy: { submittedAt: "desc" },
          select: {
            id: true,
            content: true,
            status: true,
            reviewerNotes: true,
            submittedAt: true,
            reviewedAt: true,
          },
        })
      : Promise.resolve(null),
  ]);
  const priorChoiceByQuiz = new Map(
    quizAnswers.map((a) => [a.quizId, a.choiceIndex]),
  );
  const moduleCompleted = !!moduleProgress?.completedAt;

  const groups = groupSections(
    mod.sections.map((s) => ({
      id: s.id,
      number: s.number,
      title: s.title,
      type: s.type,
      content: s.content,
    })),
  );

  // Resolve "next logical section number" for the Knowledge Check + Exercise headings.
  // We display them as Section N, N+1 — independent of mod.sections numbering.
  const lastNumberedSection = [...mod.sections]
    .reverse()
    .find((s) => s.number !== null);
  const lastIdx = lastNumberedSection
    ? extractIdx(lastNumberedSection.number!)
    : mod.sections.length;
  const knowledgeCheckNum = pad2(lastIdx + 1);
  const exerciseNum = pad2(lastIdx + 2);

  const objectives = Array.isArray(mod.learningObjectives)
    ? (mod.learningObjectives as string[])
    : [];

  return (
    <>
      <TopBar
        context={{
          label: `Module ${mod.number}`,
          rightSlot: null,
        }}
      />
      <main className="flex-1">
        <ModuleHero
          number={mod.number}
          level={mod.level}
          title={mod.title}
          heroSubtitle={mod.heroSubtitle}
          durationMinutes={mod.durationMinutes}
          audienceLabel={mod.audienceLabel}
        />

        {/* Objectives intro block is part of the first section group already if seeded so.
            Backup: render explicit objectives block here if no sections present. */}
        {groups.length === 0 && objectives.length > 0 ? (
          <section className="border-b border-line py-20">
            <div className="mx-auto max-w-[800px] px-6 sm:px-8">
              <div className="label-mono mb-3">Section 01</div>
              <h2 className="heading-serif mb-6 text-4xl text-navy">
                What you&rsquo;ll learn
              </h2>
              <div className="my-10 border-l-4 border-gold bg-cream-deep px-9 py-8">
                <div className="label-mono mb-4">Learning Objectives</div>
                <ul className="list-none">
                  {objectives.map((o, i) => (
                    <li key={i} className="relative py-2 pl-8 text-base">
                      <span className="absolute left-0 font-bold text-gold">→</span>
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ) : null}

        {groups.map((group) => (
          <SectionGroup key={group[0].id} items={group} />
        ))}

        {mod.quizzes.length > 0 ? (
          <KnowledgeCheckSection
            number={knowledgeCheckNum}
            quizzes={mod.quizzes.map((q) => ({
              id: q.id,
              question: q.question,
              options: q.options as string[],
              correctIndex: q.correctIndex,
              feedback: q.feedback,
              priorChoice: priorChoiceByQuiz.get(q.id) ?? null,
            }))}
          />
        ) : null}

        {mod.exercise ? (
          <ExerciseSection
            sectionNumber={exerciseNum}
            moduleId={mod.id}
            moduleNumber={mod.number}
            introCopy="To complete this module, submit one short reflection to your manager (or designated HR contact):"
            exercise={{
              title: mod.exercise.title,
              instructions: mod.exercise.instructions as {
                intro?: string;
                steps: string[];
                deadlineNote?: string;
              },
            }}
            latestSubmission={latestSubmission}
          />
        ) : null}

        <CompleteSection
          moduleId={mod.id}
          moduleNumber={mod.number}
          completed={moduleCompleted}
        />

        {next ? (
          <NextModule
            number={next.number}
            title={next.title}
            blurb={next.heroSubtitle ?? next.subtitle ?? undefined}
            availableFrom={next.availableFrom}
          />
        ) : null}

        <footer className="bg-navy-deep py-8 text-center">
          <p className="font-mono text-[11px] uppercase tracking-widest text-cream/50">
            Seven Generation Group · {program.title} · Module {mod.number}
          </p>
        </footer>
      </main>
    </>
  );
}

function extractIdx(label: string): number {
  // "Section 03" → 3
  const m = label.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}
