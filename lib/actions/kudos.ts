"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type Result = { ok: true; given: boolean } | { ok: false; error: string };

/**
 * Toggle a kudos from the current user to a recipient on a specific module.
 * - Returns { given: true } if kudos was added.
 * - Returns { given: false } if kudos was removed (toggling off).
 *
 * Rules:
 * - You can't kudos yourself.
 * - The recipient must have actually completed the module.
 */
export async function toggleKudos(
  recipientId: string,
  moduleId: string,
): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not signed in" };
  if (session.user.id === recipientId) {
    return { ok: false, error: "Can't give kudos to yourself." };
  }

  // Verify the recipient actually completed the module
  const completion = await db.moduleProgress.findUnique({
    where: { userId_moduleId: { userId: recipientId, moduleId } },
    select: { completedAt: true },
  });
  if (!completion?.completedAt) {
    return {
      ok: false,
      error: "That module isn't marked complete for that learner.",
    };
  }

  const existing = await db.kudos.findUnique({
    where: {
      giverId_recipientId_moduleId: {
        giverId: session.user.id,
        recipientId,
        moduleId,
      },
    },
    select: { id: true },
  });

  if (existing) {
    await db.kudos.delete({ where: { id: existing.id } });
    revalidatePath("/kudos");
    revalidatePath("/dashboard");
    return { ok: true, given: false };
  }

  await db.kudos.create({
    data: {
      giverId: session.user.id,
      recipientId,
      moduleId,
    },
  });
  revalidatePath("/kudos");
  revalidatePath("/dashboard");
  return { ok: true, given: true };
}
