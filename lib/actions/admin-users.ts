"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { UserRole } from "@prisma/client";

type Result = { ok: true } | { ok: false; error: string };

async function requireAdmin(): Promise<{ id: string } | { error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "Forbidden" };
  }
  return { id: session.user.id };
}

const VALID_ROLES: UserRole[] = ["EMPLOYEE", "MANAGER", "ADMIN"];

export async function createUser(formData: FormData): Promise<Result> {
  const me = await requireAdmin();
  if ("error" in me) return { ok: false, error: me.error };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim() || null;
  const roleRaw = String(formData.get("role") ?? "EMPLOYEE");
  const entityId = String(formData.get("entityId") ?? "") || null;
  const managerId = String(formData.get("managerId") ?? "") || null;

  if (!email.includes("@")) return { ok: false, error: "Invalid email." };
  if (!VALID_ROLES.includes(roleRaw as UserRole)) {
    return { ok: false, error: "Invalid role." };
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { ok: false, error: "A user with that email already exists." };

  await db.user.create({
    data: {
      email,
      name,
      role: roleRaw as UserRole,
      entityId: entityId || undefined,
      managerId: managerId || undefined,
    },
  });

  revalidatePath("/admin/users");
  return { ok: true };
}

export async function updateUser(
  userId: string,
  formData: FormData,
): Promise<Result> {
  const me = await requireAdmin();
  if ("error" in me) return { ok: false, error: me.error };

  const name = String(formData.get("name") ?? "").trim() || null;
  const roleRaw = String(formData.get("role") ?? "EMPLOYEE");
  const entityId = String(formData.get("entityId") ?? "") || null;
  const managerIdRaw = String(formData.get("managerId") ?? "");
  const managerId = managerIdRaw === "" ? null : managerIdRaw;

  if (!VALID_ROLES.includes(roleRaw as UserRole)) {
    return { ok: false, error: "Invalid role." };
  }
  if (managerId === userId) {
    return { ok: false, error: "User can't report to themselves." };
  }

  await db.user.update({
    where: { id: userId },
    data: {
      name,
      role: roleRaw as UserRole,
      entityId: entityId || null,
      managerId,
    },
  });

  revalidatePath("/admin/users");
  return { ok: true };
}

export async function deleteUser(userId: string): Promise<Result> {
  const me = await requireAdmin();
  if ("error" in me) return { ok: false, error: me.error };
  if (me.id === userId) return { ok: false, error: "Can't delete yourself." };

  await db.user.delete({ where: { id: userId } });
  revalidatePath("/admin/users");
  return { ok: true };
}
