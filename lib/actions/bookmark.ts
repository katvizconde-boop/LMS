"use server";

import { revalidatePath } from "next/cache";
import { requireEnrolledInModule } from "./util";
import { db } from "@/lib/db";

type Result = { ok: true; bookmarked: boolean } | { ok: false; error: string };

export async function toggleBookmark(moduleId: string): Promise<Result> {
  try {
    const { session } = await requireEnrolledInModule(moduleId);

    const existing = await db.bookmark.findUnique({
      where: {
        userId_moduleId: { userId: session.user.id, moduleId },
      },
      select: { id: true },
    });

    if (existing) {
      await db.bookmark.delete({ where: { id: existing.id } });
      revalidatePath("/dashboard");
      revalidatePath(`/programs/[slug]/modules/[position]`, "page");
      return { ok: true, bookmarked: false };
    }

    await db.bookmark.create({
      data: { userId: session.user.id, moduleId },
    });
    revalidatePath("/dashboard");
    revalidatePath(`/programs/[slug]/modules/[position]`, "page");
    return { ok: true, bookmarked: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}
