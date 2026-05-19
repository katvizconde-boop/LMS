import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Resolve the current session + ensure the user is enrolled in the program
 * that owns the given module (or is an ADMIN, who bypass).
 *
 * Returns the session and the module-with-program if access is allowed.
 * Throws if the user has no session or no enrollment.
 */
export async function requireEnrolledInModule(moduleId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not signed in");
  }
  const mod = await db.module.findUnique({
    where: { id: moduleId },
    select: { id: true, programId: true },
  });
  if (!mod) throw new Error("Module not found");

  if (session.user.role !== "ADMIN") {
    const enrollment = await db.enrollment.findUnique({
      where: {
        userId_programId: { userId: session.user.id, programId: mod.programId },
      },
      select: { id: true },
    });
    if (!enrollment) throw new Error("Not enrolled in this program");
  }

  return { session, moduleId: mod.id, programId: mod.programId };
}
