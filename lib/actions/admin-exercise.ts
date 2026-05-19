"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type Result = { ok: true } | { ok: false; error: string };

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

type ExerciseData = {
  title: string | null;
  intro: string | null;
  steps: string[];
  deadlineNote: string | null;
  deadlineOffsetDays: number | null;
};

export async function upsertExercise(
  moduleId: string,
  data: ExerciseData,
): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: "Forbidden" };
  if (data.steps.length === 0) return { ok: false, error: "At least one step required." };
  if (data.steps.some((s) => !s.trim()))
    return { ok: false, error: "Empty steps not allowed." };

  const instructions = {
    ...(data.intro ? { intro: data.intro } : {}),
    steps: data.steps.map((s) => s.trim()),
    ...(data.deadlineNote ? { deadlineNote: data.deadlineNote } : {}),
  };

  await db.exercise.upsert({
    where: { moduleId },
    create: {
      moduleId,
      title: data.title?.trim() || null,
      instructions,
      deadlineOffsetDays: data.deadlineOffsetDays ?? null,
    },
    update: {
      title: data.title?.trim() || null,
      instructions,
      deadlineOffsetDays: data.deadlineOffsetDays ?? null,
    },
  });

  await bustModuleCaches(moduleId);
  return { ok: true };
}

export async function deleteExercise(moduleId: string): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: "Forbidden" };
  await db.exercise.delete({ where: { moduleId } });
  await bustModuleCaches(moduleId);
  return { ok: true };
}
