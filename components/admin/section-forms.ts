/**
 * Per-type form shape + (de)serialization between form values and DB JSON.
 *
 * The forms in SectionEditor.tsx take a `FormShape` object scoped to the
 * selected section type, and these helpers translate to/from the canonical
 * Section.content JSON used at render time.
 */

import type {
  CalloutContent,
  ComparisonContent,
  ExampleCardContent,
  ObjectivesBoxContent,
  PromptBlockContent,
  TextContent,
  TryItContent,
} from "@/lib/section-content";
import {
  parseLines,
  parseParagraphs,
  formatParagraphs,
} from "@/lib/section-content-edit";
import type { SectionType } from "@prisma/client";

/* ---------------- form shapes ---------------- */

export type FormShape = {
  TEXT: { body: string };
  OBJECTIVES_BOX: {
    intro: string;
    label: string;
    items: string;
  };
  COMPARISON: {
    badLabel: string;
    badText: string;
    goodLabel: string;
    goodText: string;
    mono: boolean;
  };
  EXAMPLE_CARD: {
    label: string;
    intro: string;
    checklist: string;
    promptCaption: string;
    promptBody: string;
  };
  PROMPT_BLOCK: { caption: string; body: string };
  TRY_IT: { tag: string; title: string; intro: string; steps: string };
  CALLOUT: { variant: "info" | "warn" | "success"; title: string; body: string };
};

export const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  TEXT: "Text",
  OBJECTIVES_BOX: "Objectives box",
  COMPARISON: "Comparison",
  EXAMPLE_CARD: "Example card",
  PROMPT_BLOCK: "Prompt block",
  TRY_IT: "Try-it callout",
  CALLOUT: "Callout",
};

/* ---------------- to/from JSON ---------------- */

export function emptyForm<T extends SectionType>(type: T): FormShape[T] {
  switch (type) {
    case "TEXT":
      return { body: "" } as FormShape[T];
    case "OBJECTIVES_BOX":
      return { intro: "", label: "Learning Objectives", items: "" } as FormShape[T];
    case "COMPARISON":
      return {
        badLabel: "✗ Don't",
        badText: "",
        goodLabel: "✓ Do",
        goodText: "",
        mono: false,
      } as FormShape[T];
    case "EXAMPLE_CARD":
      return {
        label: "Example",
        intro: "",
        checklist: "",
        promptCaption: "",
        promptBody: "",
      } as FormShape[T];
    case "PROMPT_BLOCK":
      return { caption: "", body: "" } as FormShape[T];
    case "TRY_IT":
      return {
        tag: "Practice",
        title: "",
        intro: "",
        steps: "",
      } as FormShape[T];
    case "CALLOUT":
      return { variant: "info", title: "", body: "" } as FormShape[T];
  }
  // exhaustive
  return null as never;
}

export function formFromContent<T extends SectionType>(
  type: T,
  content: unknown,
): FormShape[T] {
  switch (type) {
    case "TEXT": {
      const c = (content ?? { paragraphs: [] }) as TextContent;
      return { body: formatParagraphs(c.paragraphs ?? []) } as FormShape[T];
    }
    case "OBJECTIVES_BOX": {
      const c = (content ?? { label: "", items: [] }) as ObjectivesBoxContent;
      return {
        intro: c.intro ?? "",
        label: c.label ?? "Learning Objectives",
        items: (c.items ?? []).join("\n"),
      } as FormShape[T];
    }
    case "COMPARISON": {
      const c = (content ?? {
        badLabel: "",
        badText: "",
        goodLabel: "",
        goodText: "",
      }) as ComparisonContent;
      return {
        badLabel: c.badLabel ?? "",
        badText: c.badText ?? "",
        goodLabel: c.goodLabel ?? "",
        goodText: c.goodText ?? "",
        mono: !!c.mono,
      } as FormShape[T];
    }
    case "EXAMPLE_CARD": {
      const c = (content ?? { label: "" }) as ExampleCardContent;
      return {
        label: c.label ?? "",
        intro: c.intro ?? "",
        checklist: (c.checklist ?? []).join("\n"),
        promptCaption: c.promptBlock?.caption ?? "",
        promptBody: c.promptBlock?.body ?? "",
      } as FormShape[T];
    }
    case "PROMPT_BLOCK": {
      const c = (content ?? { body: "" }) as PromptBlockContent;
      return {
        caption: c.caption ?? "",
        body: c.body ?? "",
      } as FormShape[T];
    }
    case "TRY_IT": {
      const c = (content ?? { tag: "", title: "", steps: [] }) as TryItContent;
      return {
        tag: c.tag ?? "",
        title: c.title ?? "",
        intro: c.intro ?? "",
        steps: (c.steps ?? []).join("\n"),
      } as FormShape[T];
    }
    case "CALLOUT": {
      const c = (content ?? { variant: "info", body: "" }) as CalloutContent;
      return {
        variant: (c.variant ?? "info") as "info" | "warn" | "success",
        title: c.title ?? "",
        body: c.body ?? "",
      } as FormShape[T];
    }
  }
  return null as never;
}

export function contentFromForm<T extends SectionType>(
  type: T,
  form: FormShape[T],
): unknown {
  switch (type) {
    case "TEXT": {
      const f = form as FormShape["TEXT"];
      return { paragraphs: parseParagraphs(f.body) } satisfies TextContent;
    }
    case "OBJECTIVES_BOX": {
      const f = form as FormShape["OBJECTIVES_BOX"];
      const out: ObjectivesBoxContent = {
        label: f.label.trim() || "Learning Objectives",
        items: parseLines(f.items),
      };
      if (f.intro.trim()) out.intro = f.intro.trim();
      return out;
    }
    case "COMPARISON": {
      const f = form as FormShape["COMPARISON"];
      const out: ComparisonContent = {
        badLabel: f.badLabel.trim(),
        badText: f.badText.trim(),
        goodLabel: f.goodLabel.trim(),
        goodText: f.goodText.trim(),
      };
      if (f.mono) out.mono = true;
      return out;
    }
    case "EXAMPLE_CARD": {
      const f = form as FormShape["EXAMPLE_CARD"];
      const out: ExampleCardContent = {
        label: f.label.trim() || "Example",
      };
      if (f.intro.trim()) out.intro = f.intro.trim();
      const checklist = parseLines(f.checklist);
      if (checklist.length > 0) out.checklist = checklist;
      if (f.promptBody.trim()) {
        out.promptBlock = { body: f.promptBody.trim() };
        if (f.promptCaption.trim()) out.promptBlock.caption = f.promptCaption.trim();
      }
      return out;
    }
    case "PROMPT_BLOCK": {
      const f = form as FormShape["PROMPT_BLOCK"];
      const out: PromptBlockContent = { body: f.body.trim() };
      if (f.caption.trim()) out.caption = f.caption.trim();
      return out;
    }
    case "TRY_IT": {
      const f = form as FormShape["TRY_IT"];
      const out: TryItContent = {
        tag: f.tag.trim() || "Practice",
        title: f.title.trim(),
        steps: parseLines(f.steps),
      };
      if (f.intro.trim()) out.intro = f.intro.trim();
      return out;
    }
    case "CALLOUT": {
      const f = form as FormShape["CALLOUT"];
      const out: CalloutContent = {
        variant: f.variant,
        body: f.body.trim(),
      };
      if (f.title.trim()) out.title = f.title.trim();
      return out;
    }
  }
  return null;
}

/** Quick lossy summary of a section's content for the list-view subhead. */
export function summarizeContent(type: SectionType, content: unknown): string {
  try {
    switch (type) {
      case "TEXT": {
        const c = content as TextContent;
        const first = c.paragraphs?.[0]?.map((p) =>
          typeof p === "string" ? p : p.strong,
        ).join("") ?? "";
        return truncate(first, 80);
      }
      case "OBJECTIVES_BOX": {
        const c = content as ObjectivesBoxContent;
        return `${c.label ?? "Objectives"} · ${(c.items ?? []).length} item(s)`;
      }
      case "COMPARISON": {
        const c = content as ComparisonContent;
        return `${c.goodLabel} vs ${c.badLabel}`;
      }
      case "EXAMPLE_CARD": {
        const c = content as ExampleCardContent;
        return c.label ?? "Example";
      }
      case "PROMPT_BLOCK": {
        const c = content as PromptBlockContent;
        return truncate(c.body ?? "", 80);
      }
      case "TRY_IT": {
        const c = content as TryItContent;
        return c.title ?? c.tag ?? "Try it";
      }
      case "CALLOUT": {
        const c = content as CalloutContent;
        return c.title ?? truncate(c.body ?? "", 60);
      }
    }
  } catch {
    return "—";
  }
  return "—";
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
