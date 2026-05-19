import { db } from "@/lib/db";
import type { UserRole } from "@prisma/client";

/**
 * Scope helper for manager-facing queries.
 *
 * - ADMIN: sees all users (or "all employees + managers" — admin filter excluded)
 * - MANAGER: sees direct reports (User.managerId = me)
 * - EMPLOYEE: empty set
 */
export function buildReportsWhere(
  viewerId: string,
  viewerRole: UserRole,
): { id: { in: string[] } } | { managerId: string } | { id: string } | null {
  if (viewerRole === "ADMIN") {
    // Everyone except the viewer themselves.
    return { id: { in: [] } } as never; // sentinel — handled below
  }
  if (viewerRole === "MANAGER") {
    return { managerId: viewerId };
  }
  return null;
}

/**
 * Fetch the list of users in a viewer's scope.
 * - ADMIN: all non-admin users (employees + managers)
 * - MANAGER: direct reports
 * - EMPLOYEE: []
 */
export async function getScopedReports(
  viewerId: string,
  viewerRole: UserRole,
) {
  if (viewerRole === "EMPLOYEE") return [];

  const where =
    viewerRole === "ADMIN"
      ? { id: { not: viewerId } }
      : { managerId: viewerId };

  return db.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      entity: { select: { code: true, name: true } },
      manager: { select: { id: true, name: true, email: true } },
    },
    orderBy: [{ name: "asc" }],
  });
}

/**
 * Submissions visible to the viewer for review.
 * - ADMIN: all submissions
 * - MANAGER: submissions whose author's managerId = viewerId
 * - EMPLOYEE: []
 */
export async function getReviewableSubmissions(
  viewerId: string,
  viewerRole: UserRole,
  opts: { statuses?: ("PENDING" | "APPROVED" | "REVISION_REQUESTED")[] } = {},
) {
  if (viewerRole === "EMPLOYEE") return [];

  const statuses = opts.statuses ?? ["PENDING"];

  return db.submission.findMany({
    where: {
      status: { in: statuses },
      ...(viewerRole === "MANAGER"
        ? { user: { managerId: viewerId } }
        : {}),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          entity: { select: { code: true, name: true } },
        },
      },
      module: {
        select: {
          id: true,
          number: true,
          title: true,
          program: { select: { slug: true, title: true } },
        },
      },
    },
    orderBy: { submittedAt: "asc" },
  });
}
