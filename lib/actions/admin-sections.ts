"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { SectionType } from "@prisma/client";

type Result = { ok: true; id?: string } | { ok: false; error: string };

const VALID_TYPES: SectionType[] = [
  "TEXT",
  "OBJECTIVES_BOX",
  "COMPARISON",
  "EXAMPLE_CARD",
  "PROMPT_BLOCK",
  "TRY_IT",
  "CALLOUT",
];

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

export async function createSection(
  moduleId: string,
  args: {
    type: SectionType;
    content: unknown;
    number?: string | null;
    title?: string | null;
  },
): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: "Forbidden" };
  if (!VALID_TYPES.includes(args.type))
    return { ok: false, error: "Invalid section type." };

  const last = await db.section.findFirst({
    where: { moduleId },
    orderBy: { position: "desc" },
    select: { position: true },
  });
  const position = (last?.position ?? 0) + 1;

  const created = await db.section.create({
    data: {
      moduleId,
      position,
      type: args.type,
      content: args.content as object,
      number: args.number ?? null,
      title: args.title ?? null,
    },
  });

  await bustModuleCaches(moduleId);
  return { ok: true, id: created.id };
}

export async function updateSection(
  sectionId: string,
  args: {
    content: unknown;
    number?: string | null;
    title?: string | null;
  },
): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: "Forbidden" };

  const updated = await db.section.update({
    where: { id: sectionId },
    data: {
      content: args.content as object,
      number: args.number ?? null,
      title: args.title ?? null,
    },
    select: { moduleId: true },
  });

  await bustModuleCaches(updated.moduleId);
  return { ok: true, id: sectionId };
}

export async function deleteSection(sectionId: string): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: "Forbidden" };

  const deleted = await db.section.delete({
    where: { id: sectionId },
    select: { moduleId: true, position: true },
  });

  // Compact remaining positions so we don't accumulate gaps.
  const remaining = await db.section.findMany({
    where: { moduleId: deleted.moduleId, position: { gt: deleted.position } },
    orderBy: { position: "asc" },
  });
  for (const s of remaining) {
    await db.section.update({
      where: { id: s.id },
      data: { position: s.position - 1 },
    });
  }

  await bustModuleCaches(deleted.moduleId);
  return { ok: true };
}

export async function moveSection(
  sectionId: string,
  direction: "up" | "down",
): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: "Forbidden" };

  const me = await db.section.findUnique({
    where: { id: sectionId },
    select: { id: true, moduleId: true, position: true },
  });
  if (!me) return { ok: false, error: "Section not found" };

  const neighbor = await db.section.findFirst({
    where: {
      moduleId: me.moduleId,
      position:
        direction === "up"
          ? { lt: me.position }
          : { gt: me.position },
    },
    orderBy: { position: direction === "up" ? "desc" : "asc" },
  });
  if (!neighbor) return { ok: true }; // already at the edge

  // Swap positions in a two-step dance to avoid unique-constraint conflicts.
  await db.section.update({
    where: { id: me.id },
    data: { position: -1 - me.position },
  });
  await db.section.update({
    where: { id: neighbor.id },
    data: { position: me.position },
  });
  await db.section.update({
    where: { id: me.id },
    data: { position: neighbor.position },
  });

  await bustModuleCaches(me.moduleId);
  return { ok: true };
}
