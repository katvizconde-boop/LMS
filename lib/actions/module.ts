"use server";

import { revalidatePath } from "next/cache";
import { requireEnrolledInModule } from "./util";
import { db } from "@/lib/db";

export async function markModuleComplete(moduleId: string) {
  const { session } = await requireEnrolledInModule(moduleId);

  await db.moduleProgress.upsert({
    where: {
      userId_moduleId: { userId: session.user.id, moduleId },
    },
    create: {
      userId: session.user.id,
      moduleId,
      completedAt: new Date(),
    },
    update: { completedAt: new Date() },
  });

  // Page revalidation — both dashboard (completion %) and current module page.
  revalidatePath("/dashboard");
  revalidatePath(`/programs/[slug]`, "page");
  revalidatePath(`/programs/[slug]/modules/[position]`, "page");
}

export async function markModuleIncomplete(moduleId: string) {
  const { session } = await requireEnrolledInModule(moduleId);

  await db.moduleProgress.update({
    where: { userId_moduleId: { userId: session.user.id, moduleId } },
    data: { completedAt: null },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/programs/[slug]`, "page");
  revalidatePath(`/programs/[slug]/modules/[position]`, "page");
}

export async function recordSectionView(sectionId: string) {
  const { session } = await requireSection(sectionId);

  await db.sectionView.upsert({
    where: {
      userId_sectionId: { userId: session.user.id, sectionId },
    },
    create: { userId: session.user.id, sectionId },
    update: {}, // viewedAt is first-view only
  });
}

async function requireSection(sectionId: string) {
  const section = await db.section.findUnique({
    where: { id: sectionId },
    select: { moduleId: true },
  });
  if (!section) throw new Error("Section not found");
  return requireEnrolledInModule(section.moduleId);
}
