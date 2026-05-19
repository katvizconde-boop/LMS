"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type Result = { ok: true; id?: string } | { ok: false; error: string };

async function requireAdmin(): Promise<boolean> {
  const session = await auth();
  return !!session?.user && session.user.role === "ADMIN";
}

async function bustModuleCaches(moduleId: string) {
  const mod = await db.module.findUnique({
    where: { id: moduleId },
    select: { programId: true },
  });
  if (mod) revalidatePath(`/admin/programs/${mod.programId}/modules/${moduleId}`);
  revalidatePath(`/programs/[slug]/modules/[position]`, "page");
}

type QuizData = {
  question: string;
  options: string[];
  correctIndex: number;
  feedback: string;
};

function validateQuiz(data: QuizData): string | null {
  if (data.question.trim().length < 5) return "Question is too short.";
  if (data.options.length < 2) return "At least 2 options required.";
  if (data.options.some((o) => !o.trim())) return "Empty options not allowed.";
  if (data.correctIndex < 0 || data.correctIndex >= data.options.length)
    return "Correct answer out of range.";
  if (data.feedback.trim().length < 5) return "Feedback is too short.";
  return null;
}

export async function createQuiz(
  moduleId: string,
  data: QuizData,
): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: "Forbidden" };
  const err = validateQuiz(data);
  if (err) return { ok: false, error: err };

  const last = await db.quiz.findFirst({
    where: { moduleId },
    orderBy: { position: "desc" },
    select: { position: true },
  });
  const position = (last?.position ?? 0) + 1;

  const created = await db.quiz.create({
    data: {
      moduleId,
      position,
      question: data.question.trim(),
      options: data.options.map((o) => o.trim()),
      correctIndex: data.correctIndex,
      feedback: data.feedback.trim(),
    },
  });
  await bustModuleCaches(moduleId);
  return { ok: true, id: created.id };
}

export async function updateQuiz(
  quizId: string,
  data: QuizData,
): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: "Forbidden" };
  const err = validateQuiz(data);
  if (err) return { ok: false, error: err };

  const updated = await db.quiz.update({
    where: { id: quizId },
    data: {
      question: data.question.trim(),
      options: data.options.map((o) => o.trim()),
      correctIndex: data.correctIndex,
      feedback: data.feedback.trim(),
    },
    select: { moduleId: true },
  });

  await bustModuleCaches(updated.moduleId);
  return { ok: true, id: quizId };
}

export async function deleteQuiz(quizId: string): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: "Forbidden" };
  const deleted = await db.quiz.delete({
    where: { id: quizId },
    select: { moduleId: true, position: true },
  });
  const rest = await db.quiz.findMany({
    where: { moduleId: deleted.moduleId, position: { gt: deleted.position } },
    orderBy: { position: "asc" },
  });
  for (const q of rest) {
    await db.quiz.update({
      where: { id: q.id },
      data: { position: q.position - 1 },
    });
  }
  await bustModuleCaches(deleted.moduleId);
  return { ok: true };
}

export async function moveQuiz(
  quizId: string,
  direction: "up" | "down",
): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: "Forbidden" };
  const me = await db.quiz.findUnique({
    where: { id: quizId },
    select: { id: true, moduleId: true, position: true },
  });
  if (!me) return { ok: false, error: "Quiz not found" };
  const neighbor = await db.quiz.findFirst({
    where: {
      moduleId: me.moduleId,
      position:
        direction === "up" ? { lt: me.position } : { gt: me.position },
    },
    orderBy: { position: direction === "up" ? "desc" : "asc" },
  });
  if (!neighbor) return { ok: true };

  await db.quiz.update({
    where: { id: me.id },
    data: { position: -1 - me.position },
  });
  await db.quiz.update({
    where: { id: neighbor.id },
    data: { position: me.position },
  });
  await db.quiz.update({
    where: { id: me.id },
    data: { position: neighbor.position },
  });
  await bustModuleCaches(me.moduleId);
  return { ok: true };
}
