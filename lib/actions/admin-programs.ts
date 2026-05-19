"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

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

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function createProgram(formData: FormData): Promise<Result> {
  const adminId = await requireAdminId();
  if (!adminId) return { ok: false, error: "Forbidden" };

  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const startDate = parseDate(formData.get("startDate"));
  const endDate = parseDate(formData.get("endDate"));

  if (!title) return { ok: false, error: "Title is required." };
  const slug = slugInput || slugify(title);
  if (!slug) return { ok: false, error: "Couldn't derive a slug from the title." };

  const existing = await db.program.findUnique({ where: { slug } });
  if (existing) {
    return { ok: false, error: "That slug is already taken." };
  }

  const created = await db.program.create({
    data: {
      slug,
      title,
      subtitle,
      description,
      startDate,
      endDate,
      ownerId: adminId,
      audienceRules: {},
    },
  });

  revalidatePath("/admin/programs");
  revalidatePath("/admin/dashboard");
  redirect(`/admin/programs/${created.id}`);
}

export async function updateProgram(
  programId: string,
  formData: FormData,
): Promise<Result> {
  const adminId = await requireAdminId();
  if (!adminId) return { ok: false, error: "Forbidden" };

  const title = String(formData.get("title") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const startDate = parseDate(formData.get("startDate"));
  const endDate = parseDate(formData.get("endDate"));

  if (!title) return { ok: false, error: "Title is required." };

  await db.program.update({
    where: { id: programId },
    data: { title, subtitle, description, startDate, endDate },
  });

  revalidatePath(`/admin/programs/${programId}`);
  revalidatePath("/admin/programs");
  revalidatePath("/admin/dashboard");
  return { ok: true };
}

export async function archiveProgram(programId: string): Promise<Result> {
  const adminId = await requireAdminId();
  if (!adminId) return { ok: false, error: "Forbidden" };

  await db.program.update({
    where: { id: programId },
    data: { archivedAt: new Date() },
  });
  revalidatePath("/admin/programs");
  revalidatePath("/admin/dashboard");
  return { ok: true };
}

export async function unarchiveProgram(programId: string): Promise<Result> {
  const adminId = await requireAdminId();
  if (!adminId) return { ok: false, error: "Forbidden" };

  await db.program.update({
    where: { id: programId },
    data: { archivedAt: null },
  });
  revalidatePath("/admin/programs");
  revalidatePath("/admin/dashboard");
  return { ok: true };
}
