"use server";

import { revalidatePath } from "next/cache";
import { requireEnrolledInModule } from "./util";
import { db } from "@/lib/db";

type Result =
  | { ok: true; submissionId: string }
  | { ok: false; error: string };

export async function submitExercise(
  moduleId: string,
  content: string,
): Promise<Result> {
  const trimmed = content.trim();
  if (trimmed.length < 20) {
    return { ok: false, error: "Tell us at least a sentence or two (20+ characters)." };
  }
  if (trimmed.length > 5000) {
    return { ok: false, error: "Keep it under 5000 characters." };
  }

  const { session } = await requireEnrolledInModule(moduleId);

  // Module needs an Exercise definition before a submission is allowed.
  const exercise = await db.exercise.findUnique({
    where: { moduleId },
    select: { id: true },
  });
  if (!exercise) return { ok: false, error: "This module has no exercise to submit." };

  const submission = await db.submission.create({
    data: {
      userId: session.user.id,
      moduleId,
      content: trimmed,
      status: "PENDING",
    },
  });

  revalidatePath(`/programs/[slug]/modules/[position]`, "page");
  revalidatePath("/submissions");

  return { ok: true, submissionId: submission.id };
}
