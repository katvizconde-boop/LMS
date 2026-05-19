"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ModuleLevel } from "@prisma/client";

type Result = { ok: true; id?: string } | { ok: false; error: string };

async function requireAdminId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  return session.user.id;
}

function parseDate(value: FormDataEntryValue | null): Date | null {
  if (!value) return null;
  const s = String(value).trim();
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

const VALID_LEVELS: ModuleLevel[] = [
  "FOUNDATION",
  "INTERMEDIATE",
  "ADVANCED",
  "MASTERY",
];

export async function createModule(
  programId: string,
  formData: FormData,
): Promise<Result> {
  const adminId = await requireAdminId();
  if (!adminId) return { ok: false, error: "Forbidden" };

  const number = String(formData.get("number") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim() || null;
  const heroSubtitle =
    String(formData.get("heroSubtitle") ?? "").trim() || null;
  const levelRaw = String(formData.get("level") ?? "FOUNDATION");
  const durationMinutes = Number(formData.get("durationMinutes") ?? 0) || null;
  const audienceLabel =
    String(formData.get("audienceLabel") ?? "").trim() || null;
  const availableFrom = parseDate(formData.get("availableFrom"));
  const objectivesRaw = String(formData.get("learningObjectives") ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!number) return { ok: false, error: "Module number is required (e.g. 02)." };
  if (!title) return { ok: false, error: "Title is required." };
  if (!VALID_LEVELS.includes(levelRaw as ModuleLevel)) {
    return { ok: false, error: "Invalid level." };
  }

  // Next position within the program.
  const last = await db.module.findFirst({
    where: { programId },
    orderBy: { position: "desc" },
    select: { position: true },
  });
  const position = (last?.position ?? 0) + 1;

  const created = await db.module.create({
    data: {
      programId,
      position,
      number,
      title,
      subtitle,
      heroSubtitle,
      level: levelRaw as ModuleLevel,
      durationMinutes,
      audienceLabel,
      availableFrom,
      learningObjectives: objectivesRaw,
    },
  });

  revalidatePath(`/admin/programs/${programId}`);
  revalidatePath(`/programs/[slug]`, "page");
  redirect(`/admin/programs/${programId}/modules/${created.id}`);
}

export async function updateModule(
  moduleId: string,
  formData: FormData,
): Promise<Result> {
  const adminId = await requireAdminId();
  if (!adminId) return { ok: false, error: "Forbidden" };

  const number = String(formData.get("number") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim() || null;
  const heroSubtitle =
    String(formData.get("heroSubtitle") ?? "").trim() || null;
  const levelRaw = String(formData.get("level") ?? "FOUNDATION");
  const durationMinutes = Number(formData.get("durationMinutes") ?? 0) || null;
  const audienceLabel =
    String(formData.get("audienceLabel") ?? "").trim() || null;
  const availableFrom = parseDate(formData.get("availableFrom"));
  const objectivesRaw = String(formData.get("learningObjectives") ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!number) return { ok: false, error: "Module number is required." };
  if (!title) return { ok: false, error: "Title is required." };
  if (!VALID_LEVELS.includes(levelRaw as ModuleLevel)) {
    return { ok: false, error: "Invalid level." };
  }

  const mod = await db.module.update({
    where: { id: moduleId },
    data: {
      number,
      title,
      subtitle,
      heroSubtitle,
      level: levelRaw as ModuleLevel,
      durationMinutes,
      audienceLabel,
      availableFrom,
      learningObjectives: objectivesRaw,
    },
  });

  revalidatePath(`/admin/programs/${mod.programId}`);
  revalidatePath(`/programs/[slug]`, "page");
  revalidatePath(`/programs/[slug]/modules/[position]`, "page");
  return { ok: true };
}

export async function deleteModule(moduleId: string): Promise<Result> {
  const adminId = await requireAdminId();
  if (!adminId) return { ok: false, error: "Forbidden" };

  const mod = await db.module.delete({
    where: { id: moduleId },
    select: { programId: true },
  });
  revalidatePath(`/admin/programs/${mod.programId}`);
  revalidatePath(`/programs/[slug]`, "page");
  return { ok: true };
}
