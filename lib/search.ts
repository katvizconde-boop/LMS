import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export type SearchHit = {
  moduleId: string;
  number: string;
  title: string;
  subtitle: string | null;
  program: { slug: string; title: string };
  position: number;
  /** Why this module matched. */
  reason: "module_title" | "module_subtitle" | "section_content";
  /** Excerpt around the matched phrase (best-effort). */
  excerpt: string | null;
};

const MIN_QUERY_LEN = 2;
const MAX_RESULTS = 25;

export async function searchForUser(
  userId: string,
  isAdmin: boolean,
  rawQuery: string,
): Promise<SearchHit[]> {
  const q = rawQuery.trim();
  if (q.length < MIN_QUERY_LEN) return [];

  const moduleWhere = isAdmin
    ? {}
    : { program: { enrollments: { some: { userId } } } };

  const moduleMatches = await db.module.findMany({
    where: {
      ...moduleWhere,
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { subtitle: { contains: q, mode: "insensitive" } },
        { heroSubtitle: { contains: q, mode: "insensitive" } },
      ],
    },
    include: { program: { select: { slug: true, title: true } } },
    take: MAX_RESULTS,
  });

  // Section content lives in JSON; use a raw query to filter on serialized text.
  const enrollmentJoin = isAdmin
    ? Prisma.empty
    : Prisma.sql`JOIN "Enrollment" e ON e."programId" = m."programId" AND e."userId" = ${userId}`;
  const pattern = `%${q}%`;
  const sectionMatches = await db.$queryRaw<
    Array<{
      moduleId: string;
      number: string;
      title: string;
      subtitle: string | null;
      position: number;
      programSlug: string;
      programTitle: string;
      content: unknown;
    }>
  >(Prisma.sql`
    SELECT
      m."id" AS "moduleId",
      m."number" AS "number",
      m."title" AS "title",
      m."subtitle" AS "subtitle",
      m."position" AS "position",
      p."slug" AS "programSlug",
      p."title" AS "programTitle",
      s."content" AS "content"
    FROM "Section" s
    JOIN "Module" m ON s."moduleId" = m."id"
    JOIN "Program" p ON m."programId" = p."id"
    ${enrollmentJoin}
    WHERE s."content"::text ILIKE ${pattern}
    LIMIT ${MAX_RESULTS}
  `);

  // Dedupe — module-level hits win, then section hits add new modules with excerpts.
  const byModule = new Map<string, SearchHit>();
  for (const m of moduleMatches) {
    const titleMatch = m.title.toLowerCase().includes(q.toLowerCase());
    const subtitleMatch = (m.subtitle ?? "")
      .toLowerCase()
      .includes(q.toLowerCase());
    byModule.set(m.id, {
      moduleId: m.id,
      number: m.number,
      title: m.title,
      subtitle: m.subtitle,
      program: m.program,
      position: m.position,
      reason: titleMatch
        ? "module_title"
        : subtitleMatch
          ? "module_subtitle"
          : "module_title",
      excerpt: null,
    });
  }
  for (const s of sectionMatches) {
    if (byModule.has(s.moduleId)) continue;
    byModule.set(s.moduleId, {
      moduleId: s.moduleId,
      number: s.number,
      title: s.title,
      subtitle: s.subtitle,
      program: { slug: s.programSlug, title: s.programTitle },
      position: s.position,
      reason: "section_content",
      excerpt: excerpt(JSON.stringify(s.content), q),
    });
  }

  return Array.from(byModule.values()).slice(0, MAX_RESULTS);
}

/**
 * Returns ~120 chars of the haystack around the first case-insensitive match.
 * Surrounds the match with ellipsis if we trimmed either end.
 */
function excerpt(haystack: string, needle: string): string | null {
  const hayLower = haystack.toLowerCase();
  const idx = hayLower.indexOf(needle.toLowerCase());
  if (idx === -1) return null;
  const radius = 60;
  const start = Math.max(0, idx - radius);
  const end = Math.min(haystack.length, idx + needle.length + radius);
  const before = start > 0 ? "…" : "";
  const after = end < haystack.length ? "…" : "";
  return (
    before +
    haystack
      .slice(start, end)
      .replace(/\s+/g, " ")
      .trim() +
    after
  );
}
