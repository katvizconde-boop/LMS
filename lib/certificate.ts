import crypto from "node:crypto";
import { db } from "@/lib/db";

/** Deterministic certificate number — stable per (user, program). */
export function certificateNumber(userId: string, programId: string): string {
  const h = crypto
    .createHash("sha256")
    .update(`${userId}::${programId}`)
    .digest("hex");
  return `7G-${h.slice(0, 8).toUpperCase()}`;
}

// Per-module certificate helpers live in lib/certificate-module.ts.

export type CertificateEligibility =
  | {
      ok: true;
      program: { id: string; title: string; subtitle: string | null };
      user: { id: string; name: string | null; email: string };
      completedAt: Date;
      moduleCount: number;
      number: string;
    }
  | { ok: false; reason: "not_found" | "not_enrolled" | "incomplete" };

export async function checkCertificateEligibility(
  userId: string,
  programId: string,
): Promise<CertificateEligibility> {
  const program = await db.program.findUnique({
    where: { id: programId },
    include: {
      modules: { select: { id: true } },
      enrollments: {
        where: { userId },
        select: { id: true },
      },
    },
  });
  if (!program) return { ok: false, reason: "not_found" };
  if (program.enrollments.length === 0)
    return { ok: false, reason: "not_enrolled" };

  if (program.modules.length === 0) {
    return { ok: false, reason: "incomplete" };
  }

  const completedRows = await db.moduleProgress.findMany({
    where: {
      userId,
      moduleId: { in: program.modules.map((m) => m.id) },
      completedAt: { not: null },
    },
    select: { completedAt: true },
    orderBy: { completedAt: "desc" },
  });
  if (completedRows.length < program.modules.length) {
    return { ok: false, reason: "incomplete" };
  }

  const latest = completedRows[0].completedAt!;
  const user = await db.user.findUniqueOrThrow({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });

  return {
    ok: true,
    program: {
      id: program.id,
      title: program.title,
      subtitle: program.subtitle,
    },
    user,
    completedAt: latest,
    moduleCount: program.modules.length,
    number: certificateNumber(userId, programId),
  };
}
