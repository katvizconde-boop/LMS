import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { TopBar } from "@/components/learner/TopBar";
import { Lock, Check, ArrowRight } from "lucide-react";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const program = await db.program.findUnique({
    where: { slug },
    select: { title: true },
  });
  return { title: program?.title ?? "Program" };
}

export default async function ProgramPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const session = (await auth())!;
  const { slug } = await params;

  const program = await db.program.findUnique({
    where: { slug },
    include: {
      modules: { orderBy: { position: "asc" } },
      enrollments: { where: { userId: session.user.id }, select: { id: true } },
    },
  });

  if (!program) notFound();
  if (program.enrollments.length === 0) redirect("/dashboard");

  const completed = await db.moduleProgress.findMany({
    where: {
      userId: session.user.id,
      moduleId: { in: program.modules.map((m) => m.id) },
      completedAt: { not: null },
    },
    select: { moduleId: true },
  });
  const completedSet = new Set(completed.map((c) => c.moduleId));

  const now = new Date();

  return (
    <>
      <TopBar
        context={{
          label: program.title,
          rightSlot: null,
        }}
      />
      <main className="flex-1">
        <header className="relative overflow-hidden bg-navy text-cream">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-1/2 -right-[10%] h-[600px] w-[600px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(184,148,63,0.08) 0%, transparent 70%)",
            }}
          />
          <div className="relative mx-auto max-w-[1100px] px-6 py-20 sm:px-8 sm:py-28">
            <div className="label-mono mb-6 inline-block rounded-sm border border-gold px-3 py-1.5">
              Program
            </div>
            <h1 className="heading-serif text-5xl sm:text-7xl">
              {program.title}
            </h1>
            {program.subtitle ? (
              <p className="mt-6 max-w-2xl text-xl text-cream/75">
                {program.subtitle}
              </p>
            ) : null}
            <div className="mt-12 flex flex-wrap gap-8 border-t border-gold/30 pt-8">
              <Meta label="Modules" value={String(program.modules.length)} />
              {program.startDate ? (
                <Meta
                  label="Runs"
                  value={formatRange(program.startDate, program.endDate)}
                />
              ) : null}
              <Meta
                label="Completed"
                value={`${completedSet.size}/${program.modules.length}`}
              />
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-[800px] px-6 py-16 sm:px-8">
          <div className="label-mono mb-3">Modules</div>
          <h2 className="heading-serif text-3xl text-navy">
            What&rsquo;s in this program
          </h2>
          {program.description ? (
            <p className="mt-4 text-base text-navy-soft">{program.description}</p>
          ) : null}

          <ul className="mt-10 divide-y divide-line border-y border-line">
            {program.modules.map((m) => {
              const locked = m.availableFrom ? m.availableFrom > now : false;
              const done = completedSet.has(m.id);
              const canBypass = session.user.role === "ADMIN";
              return (
                <li key={m.id}>
                  <ModuleRow
                    href={`/programs/${program.slug}/modules/${m.position}`}
                    number={m.number}
                    title={m.title}
                    subtitle={m.subtitle}
                    duration={m.durationMinutes ?? null}
                    level={m.level}
                    locked={locked}
                    done={done}
                    availableFrom={m.availableFrom}
                    canBypassLock={canBypass}
                  />
                </li>
              );
            })}
          </ul>
        </section>
      </main>
    </>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-widest text-gold">
        {label}
      </span>
      <span className="text-base font-medium text-cream">{value}</span>
    </div>
  );
}

function ModuleRow({
  href,
  number,
  title,
  subtitle,
  duration,
  level,
  locked,
  done,
  availableFrom,
  canBypassLock,
}: {
  href: string;
  number: string;
  title: string;
  subtitle: string | null;
  duration: number | null;
  level: string;
  locked: boolean;
  done: boolean;
  availableFrom: Date | null;
  canBypassLock: boolean;
}) {
  const inner = (
    <div className="flex items-center gap-6 py-6">
      <div className="font-mono text-sm font-medium text-gold">{number}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="heading-serif text-xl text-navy">{title}</h3>
          {done ? (
            <Check className="h-4 w-4 text-success" aria-label="Completed" />
          ) : null}
          {locked ? (
            <Lock className="h-3.5 w-3.5 text-muted" aria-label="Locked" />
          ) : null}
        </div>
        {subtitle ? (
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        ) : null}
        <div className="mt-2 flex gap-4 font-mono text-[10px] uppercase tracking-widest text-muted">
          <span>{level.toLowerCase()}</span>
          {duration ? <span>~{duration} min</span> : null}
          {locked && availableFrom ? (
            <span className="text-gold">
              Available {availableFrom.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          ) : null}
        </div>
      </div>
      {!locked || canBypassLock ? <ArrowRight className="h-4 w-4 text-muted" /> : null}
    </div>
  );

  if (locked && !canBypassLock) {
    return <div className="opacity-50 cursor-not-allowed">{inner}</div>;
  }
  return (
    <Link
      href={href}
      className="block transition-colors hover:bg-cream-deep/40"
    >
      {inner}
    </Link>
  );
}

function formatRange(start: Date, end: Date | null): string {
  const startStr = start.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
  if (!end) return startStr;
  const endStr = end.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
  return `${startStr} → ${endStr}`;
}
