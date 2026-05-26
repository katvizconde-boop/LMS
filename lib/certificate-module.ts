import crypto from "node:crypto";
import { db } from "@/lib/db";

/** Per-module certificate number — stable per (user, module). Prefix M-. */
export function moduleCertificateNumber(
  userId: string,
  moduleId: string,
): string {
  const h = crypto
    .createHash("sha256")
    .update(`module::${userId}::${moduleId}`)
    .digest("hex");
  return `7G-M-${h.slice(0, 8).toUpperCase()}`;
}

export type ModuleCertEligibility =
  | {
      ok: true;
      module: {
        id: string;
        number: string;
        title: string;
        level: string;
      };
      program: { title: string; slug: string };
      user: { id: string; name: string | null; email: string };
      completedAt: Date;
      number: string;
    }
  | { ok: false; reason: "not_found" | "not_enrolled" | "incomplete" };

export async function checkModuleCertificateEligibility(
  userId: string,
  moduleId: string,
): Promise<ModuleCertEligibility> {
  const mod = await db.module.findUnique({
    where: { id: moduleId },
    include: {
      program: {
        select: {
          title: true,
          slug: true,
          enrollments: { where: { userId }, select: { id: true } },
        },
      },
    },
  });
  if (!mod) return { ok: false, reason: "not_found" };
  if (mod.program.enrollments.length === 0)
    return { ok: false, reason: "not_enrolled" };

  const progress = await db.moduleProgress.findUnique({
    where: { userId_moduleId: { userId, moduleId } },
    select: { completedAt: true },
  });
  if (!progress?.completedAt) return { ok: false, reason: "incomplete" };

  const user = await db.user.findUniqueOrThrow({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });

  return {
    ok: true,
    module: {
      id: mod.id,
      number: mod.number,
      title: mod.title,
      level: mod.level,
    },
    program: { title: mod.program.title, slug: mod.program.slug },
    user,
    completedAt: progress.completedAt,
    number: moduleCertificateNumber(userId, moduleId),
  };
}
