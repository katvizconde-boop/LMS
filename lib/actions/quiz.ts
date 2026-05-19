"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type Result =
  | { ok: true; correct: boolean }
  | { ok: false; error: string };

/**
 * Record a learner's quiz answer. Idempotent — the unique (userId, quizId)
 * constraint means once-answered stays answered (matches reference HTML).
 */
export async function recordQuizAnswer(
  quizId: string,
  choiceIndex: number,
): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not signed in" };

  const quiz = await db.quiz.findUnique({
    where: { id: quizId },
    include: { module: { select: { programId: true, id: true } } },
  });
  if (!quiz) return { ok: false, error: "Quiz not found" };

  // Enrollment check (admins bypass).
  if (session.user.role !== "ADMIN") {
    const enrollment = await db.enrollment.findUnique({
      where: {
        userId_programId: {
          userId: session.user.id,
          programId: quiz.module.programId,
        },
      },
      select: { id: true },
    });
    if (!enrollment) return { ok: false, error: "Not enrolled" };
  }

  const correct = choiceIndex === quiz.correctIndex;

  // First answer wins — don't overwrite a prior choice.
  await db.quizAnswer.upsert({
    where: { userId_quizId: { userId: session.user.id, quizId } },
    create: {
      userId: session.user.id,
      quizId,
      choiceIndex,
      correct,
    },
    update: {}, // no-op if already answered
  });

  // Refresh the module page so server-rendered hydration state is up to date
  // for any future navigations.
  revalidatePath(`/programs/[slug]/modules/[position]`, "page");

  return { ok: true, correct };
}
