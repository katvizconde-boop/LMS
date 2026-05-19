import type { SectionType } from "@prisma/client";
import type {
  CalloutContent,
  ComparisonContent,
  ExampleCardContent,
  ObjectivesBoxContent,
  ParagraphPart,
  PromptBlockContent,
  TextContent,
  TryItContent,
} from "@/lib/section-content";

/**
 * A "logical section" in the reference HTML maps to N consecutive Section rows
 * in the DB: only the first carries the section number + heading; the rest are
 * sub-blocks. SectionGroup wraps them in one <section> with one heading.
 */

type GroupSection = {
  id: string;
  number: string | null;
  title: string | null;
  type: SectionType;
  content: unknown;
};

export function SectionGroup({ items }: { items: GroupSection[] }) {
  if (items.length === 0) return null;
  const head = items[0];
  return (
    <section className="border-b border-line last:border-b-0">
      <div className="mx-auto max-w-[800px] px-6 py-20 sm:px-8">
        {head.number ? <div className="label-mono mb-3">{head.number}</div> : null}
        {head.title ? (
          <h2 className="heading-serif mb-6 text-4xl text-navy">{head.title}</h2>
        ) : null}
        {items.map((s) => (
          <Block key={s.id} type={s.type} content={s.content} />
        ))}
      </div>
    </section>
  );
}

/**
 * Group a flat Section list by consecutive runs: each group starts at the first
 * Section that carries a `number` or `title`, and continues until the next one.
 */
export function groupSections<T extends GroupSection>(sections: T[]): T[][] {
  const groups: T[][] = [];
  let current: T[] = [];
  for (const s of sections) {
    const startsNew = (s.number || s.title) && current.length > 0;
    if (startsNew) {
      groups.push(current);
      current = [];
    }
    current.push(s);
  }
  if (current.length > 0) groups.push(current);
  return groups;
}

function Block({ type, content }: { type: SectionType; content: unknown }) {
  switch (type) {
    case "TEXT":
      return <TextBlock {...(content as TextContent)} />;
    case "OBJECTIVES_BOX":
      return <ObjectivesBox {...(content as ObjectivesBoxContent)} />;
    case "COMPARISON":
      return <ComparisonBlock {...(content as ComparisonContent)} />;
    case "EXAMPLE_CARD":
      return <ExampleCard {...(content as ExampleCardContent)} />;
    case "PROMPT_BLOCK":
      return <PromptBlock {...(content as PromptBlockContent)} />;
    case "TRY_IT":
      return <TryItBlock {...(content as TryItContent)} />;
    case "CALLOUT":
      return <CalloutBlock {...(content as CalloutContent)} />;
  }
}

/* ============================== TEXT ============================== */

function TextBlock({ paragraphs }: TextContent) {
  return (
    <div className="prose-editorial">
      {paragraphs.map((parts, i) => (
        <p key={i}>{parts.map(renderPart)}</p>
      ))}
    </div>
  );
}

function renderPart(part: ParagraphPart, i: number): React.ReactNode {
  if (typeof part === "string") return <span key={i}>{part}</span>;
  return <strong key={i}>{part.strong}</strong>;
}

/* ============================ OBJECTIVES ========================== */

function ObjectivesBox({ intro, label, items }: ObjectivesBoxContent) {
  return (
    <>
      {intro ? (
        <p className="prose-editorial !mb-0 text-[17px] leading-relaxed text-navy-soft">
          {intro}
        </p>
      ) : null}
      <div className="my-10 border-l-4 border-gold bg-cream-deep px-9 py-8">
        <div className="label-mono mb-4">{label}</div>
        <ul className="list-none">
          {items.map((item, i) => (
            <li key={i} className="relative py-2 pl-8 text-base">
              <span className="absolute left-0 font-bold text-gold">→</span>
              {item.includes("**") ? <ObjectiveText raw={item} /> : item}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function ObjectiveText({ raw }: { raw: string }) {
  const parts = raw.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) => {
        const m = p.match(/^\*\*(.+)\*\*$/);
        return m ? <strong key={i}>{m[1]}</strong> : <span key={i}>{p}</span>;
      })}
    </>
  );
}

/* ============================ COMPARISON ========================== */

function ComparisonBlock({
  goodLabel,
  goodText,
  badLabel,
  badText,
  mono,
}: ComparisonContent) {
  const textClass = mono ? "font-mono text-[13px]" : "text-sm";
  return (
    <div className="my-8 grid gap-5 sm:grid-cols-2">
      <div className="rounded border border-[#E8C5C5] bg-[#FDF4F4] p-6">
        <div className="mb-2.5 font-mono text-[10px] font-medium uppercase tracking-widest text-danger">
          {badLabel}
        </div>
        <div className={`${textClass} text-navy-soft leading-relaxed`}>{badText}</div>
      </div>
      <div className="rounded border border-success-border bg-success-bg p-6">
        <div className="mb-2.5 font-mono text-[10px] font-medium uppercase tracking-widest text-success">
          {goodLabel}
        </div>
        <div className={`${textClass} text-navy-soft leading-relaxed`}>{goodText}</div>
      </div>
    </div>
  );
}

/* ============================ EXAMPLE_CARD ========================== */

function ExampleCard({ label, intro, checklist, promptBlock }: ExampleCardContent) {
  return (
    <div className="my-7 rounded border border-line bg-white p-7 shadow-[0_2px_12px_rgba(26,35,50,0.04)]">
      <div className="label-mono mb-3">{label}</div>
      {intro ? <p className="text-sm text-muted">{intro}</p> : null}
      {checklist ? (
        <ul className="list-none">
          {checklist.map((item, i) => (
            <li key={i} className="py-2 text-base">
              ☐ &nbsp;{item}
            </li>
          ))}
        </ul>
      ) : null}
      {promptBlock ? <PromptBlock {...promptBlock} /> : null}
    </div>
  );
}

/* ============================ PROMPT_BLOCK ========================== */

function PromptBlock({ caption, body }: PromptBlockContent) {
  return (
    <>
      {caption ? <p className="mt-2 text-sm text-muted">{caption}</p> : null}
      <div className="mt-3 rounded-sm border-l-[3px] border-gold bg-navy px-6 py-5 font-mono text-sm leading-relaxed text-cream">
        {body}
      </div>
    </>
  );
}

/* ============================ TRY_IT ========================== */

function TryItBlock({ tag, title, intro, steps }: TryItContent) {
  return (
    <div className="relative my-12 overflow-hidden rounded bg-navy p-10 text-cream">
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-[200px] w-[200px]"
        style={{
          background:
            "radial-gradient(circle, rgba(184,148,63,0.15) 0%, transparent 70%)",
        }}
      />
      <span className="relative mb-5 inline-block bg-gold px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-navy">
        {tag}
      </span>
      <h3 className="relative mb-4 font-serif text-3xl font-normal">{title}</h3>
      {intro ? <p className="relative mb-4 text-cream/85">{intro}</p> : null}
      <ol className="relative list-decimal space-y-2.5 pl-6 text-cream/85 marker:text-gold marker:font-bold">
        {steps.map((s, i) => (
          <li key={i} className="pl-2">
            {s}
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ============================ CALLOUT ========================== */

function CalloutBlock({ variant, title, body }: CalloutContent) {
  const styles = {
    info: "border-gold bg-cream-deep",
    warn: "border-danger bg-danger-bg",
    success: "border-success bg-success-bg",
  } as const;
  return (
    <div className={`my-8 border-l-4 ${styles[variant]} px-6 py-5`}>
      {title ? <p className="mb-2 font-semibold text-navy">{title}</p> : null}
      <p className="text-sm leading-relaxed text-navy-soft">{body}</p>
    </div>
  );
}
