"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type Result = { ok: true; added?: number } | { ok: false; error: string };

async function requireAdmin(): Promise<boolean> {
  const session = await auth();
  return !!session?.user && session.user.role === "ADMIN";
}

export async function enrollUsers(
  programId: string,
  userIds: string[],
): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: "Forbidden" };
  if (userIds.length === 0) return { ok: false, error: "No users selected." };

  const result = await db.enrollment.createMany({
    data: userIds.map((userId) => ({ userId, programId })),
    skipDuplicates: true,
  });

  revalidatePath(`/admin/programs/${programId}`);
  revalidatePath("/admin/dashboard");
  revalidatePath("/dashboard");
  return { ok: true, added: result.count };
}

export async function unenrollUser(
  programId: string,
  userId: string,
): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: "Forbidden" };

  await db.enrollment.delete({
    where: { userId_programId: { userId, programId } },
  });

  revalidatePath(`/admin/programs/${programId}`);
  revalidatePath("/admin/dashboard");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function enrollByCriteria(
  programId: string,
  filter: { entityIds?: string[]; roles?: ("EMPLOYEE" | "MANAGER" | "ADMIN")[] },
): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: "Forbidden" };

  const users = await db.user.findMany({
    where: {
      ...(filter.entityIds && filter.entityIds.length > 0
        ? { entityId: { in: filter.entityIds } }
        : {}),
      ...(filter.roles && filter.roles.length > 0
        ? { role: { in: filter.roles } }
        : {}),
    },
    select: { id: true },
  });

  if (users.length === 0) {
    return { ok: false, error: "No users match those filters." };
  }

  const result = await db.enrollment.createMany({
    data: users.map((u) => ({ userId: u.id, programId })),
    skipDuplicates: true,
  });

  revalidatePath(`/admin/programs/${programId}`);
  revalidatePath("/admin/dashboard");
  revalidatePath("/dashboard");
  return { ok: true, added: result.count };
}
