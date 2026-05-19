"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type Result = { ok: true } | { ok: false; error: string };

/**
 * Authorize reviewer access to a submission.
 * - ADMIN: any submission
 * - MANAGER: only submissions from direct reports
 */
type AuthResult =
  | { error: string }
  | {
      reviewerId: string;
      submission: { id: string; user: { managerId: string | null } };
    };

async function loadAuthorizedSubmission(
  submissionId: string,
): Promise<AuthResult> {
  const session = await auth();
  const reviewerId = session?.user?.id;
  if (!session || !reviewerId) return { error: "Not signed in" };
  if (session.user.role === "EMPLOYEE") {
    return { error: "Not a reviewer" };
  }

  const submission = await db.submission.findUnique({
    where: { id: submissionId },
    include: {
      user: { select: { id: true, managerId: true } },
    },
  });
  if (!submission) return { error: "Submission not found" };

  if (
    session.user.role === "MANAGER" &&
    submission.user.managerId !== reviewerId
  ) {
    return { error: "Not your report's submission" };
  }

  return { reviewerId, submission };
}

export async function approveSubmission(submissionId: string): Promise<Result> {
  const auth = await loadAuthorizedSubmission(submissionId);
  if ("error" in auth) return { ok: false, error: auth.error };

  await db.submission.update({
    where: { id: submissionId },
    data: {
      status: "APPROVED",
      reviewerId: auth.reviewerId,
      reviewedAt: new Date(),
    },
  });

  revalidatePath("/reviews");
  revalidatePath("/team");
  revalidatePath(`/programs/[slug]/modules/[position]`, "page");
  return { ok: true };
}

export async function requestRevision(
  submissionId: string,
  notes: string,
): Promise<Result> {
  const trimmed = notes.trim();
  if (trimmed.length < 5) {
    return { ok: false, error: "Add a short note so the learner knows what to change." };
  }
  if (trimmed.length > 2000) {
    return { ok: false, error: "Keep notes under 2000 characters." };
  }

  const auth = await loadAuthorizedSubmission(submissionId);
  if ("error" in auth) return { ok: false, error: auth.error };

  await db.submission.update({
    where: { id: submissionId },
    data: {
      status: "REVISION_REQUESTED",
      reviewerId: auth.reviewerId,
      reviewerNotes: trimmed,
      reviewedAt: new Date(),
    },
  });

  revalidatePath("/reviews");
  revalidatePath("/team");
  revalidatePath(`/programs/[slug]/modules/[position]`, "page");
  return { ok: true };
}
