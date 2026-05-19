/**
 * Strongly-typed shape for Section.content (JSON column).
 *
 * Seed data is the source of truth for these shapes. The admin module composer
 * (Phase 4) will validate against zod schemas mirroring this union.
 */

import type { SectionType } from "@prisma/client";

export type ParagraphPart = string | { strong: string };

export type TextContent = {
  paragraphs: ParagraphPart[][];
};

export type ObjectivesBoxContent = {
  /** Optional intro paragraph rendered above the box (kept in same logical section). */
  intro?: string;
  label: string;
  items: string[];
};

export type ComparisonContent = {
  goodLabel: string;
  goodText: string;
  badLabel: string;
  badText: string;
  mono?: boolean;
};

export type ExampleCardContent = {
  label: string;
  intro?: string;
  checklist?: string[];
  promptBlock?: { caption?: string; body: string };
};

export type PromptBlockContent = {
  caption?: string;
  body: string;
};

export type TryItContent = {
  tag: string;
  title: string;
  intro?: string;
  steps: string[];
};

export type CalloutContent = {
  variant: "info" | "warn" | "success";
  title?: string;
  body: string;
};

export type SectionContentByType = {
  TEXT: TextContent;
  OBJECTIVES_BOX: ObjectivesBoxContent;
  COMPARISON: ComparisonContent;
  EXAMPLE_CARD: ExampleCardContent;
  PROMPT_BLOCK: PromptBlockContent;
  TRY_IT: TryItContent;
  CALLOUT: CalloutContent;
};

export type TypedSectionContent =
  | { type: "TEXT"; content: TextContent }
  | { type: "OBJECTIVES_BOX"; content: ObjectivesBoxContent }
  | { type: "COMPARISON"; content: ComparisonContent }
  | { type: "EXAMPLE_CARD"; content: ExampleCardContent }
  | { type: "PROMPT_BLOCK"; content: PromptBlockContent }
  | { type: "TRY_IT"; content: TryItContent }
  | { type: "CALLOUT"; content: CalloutContent };

export function asTyped(
  type: SectionType,
  raw: unknown,
): TypedSectionContent {
  // We trust seed/admin to produce well-shaped JSON. Phase 4 admin composer
  // will validate with zod before write.
  return { type, content: raw } as TypedSectionContent;
}
