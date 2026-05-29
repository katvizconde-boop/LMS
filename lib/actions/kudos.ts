"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type Result =
  | { ok: true; given: boolean; count: number }
  | { ok: false; error: string };

/**
 * Toggle a kudos from the current user to a recipient on a specific module.
 */
export async function toggleKudos(
  toUserId: string,
  moduleId: string,
): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not signed in" };
  if (session.user.id === toUserId) {
    return { ok: false, error: "Can't kudos yourself." };
  }

  const completed = await db.moduleProgress.findUnique({
    where: { userId_moduleId: { userId: toUserId, moduleId } },
    select: { completedAt: true },
  });
  if (!completed?.completedAt) {
    return { ok: false, error: "They haven't finished that module yet." };
  }

  const existing = await db.kudos.findUnique({
    where: {
      fromUserId_toUserId_moduleId: {
        fromUserId: session.user.id,
        toUserId,
        moduleId,
      },
    },
    select: { id: true },
  });

  if (existing) {
    await db.kudos.delete({ where: { id: existing.id } });
  } else {
    await db.kudos.create({
      data: { fromUserId: session.user.id, toUserId, moduleId },
    });
  }

  const count = await db.kudos.count({ where: { toUserId, moduleId } });
  revalidatePath("/dashboard");
  revalidatePath("/kudos");
  return { ok: true, given: !existing, count };
}

/** Alias so KudosWall can call sendKudos. */
export async function sendKudos(
  toUserId: string,
  moduleId: string,
  _emoji: string = "👏",
): Promise<Result> {
  return toggleKudos(toUserId, moduleId);
}
