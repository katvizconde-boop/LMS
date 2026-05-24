"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type Result = { ok: true } | { ok: false; error: string };

const MIN_PASSWORD_LEN = 8;
const BCRYPT_ROUNDS = 10;

export async function changeOwnPassword(
  currentPassword: string,
  newPassword: string,
): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not signed in" };

  if (newPassword.length < MIN_PASSWORD_LEN) {
    return { ok: false, error: `New password must be at least ${MIN_PASSWORD_LEN} characters.` };
  }
  if (currentPassword === newPassword) {
    return { ok: false, error: "Pick a different password than your current one." };
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });
  if (!user?.passwordHash) {
    return { ok: false, error: "No password set. Ask your admin to set one." };
  }

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) return { ok: false, error: "Current password is incorrect." };

  const newHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await db.user.update({
    where: { id: session.user.id },
    data: { passwordHash: newHash },
  });
  revalidatePath("/profile");
  return { ok: true };
}

export async function updateOwnName(name: string): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not signed in" };
  const trimmed = name.trim();
  if (trimmed.length < 2) return { ok: false, error: "Name is too short." };
  if (trimmed.length > 80) return { ok: false, error: "Name is too long." };
  await db.user.update({
    where: { id: session.user.id },
    data: { name: trimmed },
  });
  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { ok: true };
}
