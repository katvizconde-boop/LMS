import type { ModuleLevel } from "@prisma/client";

type Props = {
  number: string;
  level: ModuleLevel;
  title: string;
  heroSubtitle: string | null;
  durationMinutes: number | null;
  audienceLabel: string | null;
  format?: string;
  rightSlot?: React.ReactNode;
};

const LEVEL_LABEL: Record<ModuleLevel, string> = {
  FOUNDATION: "Foundation",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  MASTERY: "Mastery",
};

export function ModuleHero({
  number,
  level,
  title,
  heroSubtitle,
  durationMinutes,
  audienceLabel,
  format = "Self-paced",
  rightSlot,
}: Props) {
  return (
    <section className="relative overflow-hidden bg-navy text-cream">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-1/2 -right-[10%] h-[600px] w-[600px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(184,148,63,0.08) 0%, transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-[1100px] px-6 py-20 sm:px-8 sm:py-28">
        {rightSlot ? (
          <div className="absolute right-6 top-6 sm:right-8 sm:top-8">
            {rightSlot}
          </div>
        ) : null}
        <div className="label-mono mb-6 inline-block rounded-sm border border-gold px-3 py-1.5">
          Module {number} &nbsp;·&nbsp; {LEVEL_LABEL[level]}
        </div>
        <Title title={title} />
        {heroSubtitle ? (
          <p className="mt-6 max-w-2xl text-xl text-cream/75">{heroSubtitle}</p>
        ) : null}
        <div className="mt-12 flex flex-wrap gap-8 border-t border-gold/30 pt-8">
          {durationMinutes ? (
            <Meta label="Duration" value={`~${durationMinutes} minutes`} />
          ) : null}
          <Meta label="Level" value={LEVEL_LABEL[level]} />
          <Meta label="Format" value={format} />
          {audienceLabel ? <Meta label="For" value={audienceLabel} /> : null}
        </div>
      </div>
    </section>
  );
}

/**
 * Title: renders an italic gold accent on the final word (e.g. "Meet Claude.")
 * to match the editorial pattern in the reference HTML.
 */
function Title({ title }: { title: string }) {
  const trimmed = title.trim();
  const accentMatch = trimmed.match(/^(.*?)(\S+)([\.\?\!]?)$/);
  if (!accentMatch) {
    return (
      <h1 className="heading-serif text-5xl sm:text-7xl">{title}</h1>
    );
  }
  const [, lead, lastWord, punct] = accentMatch;
  return (
    <h1 className="heading-serif text-5xl sm:text-7xl">
      {lead}
      <em className="not-italic text-gold italic">{lastWord}</em>
      {punct}
    </h1>
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
