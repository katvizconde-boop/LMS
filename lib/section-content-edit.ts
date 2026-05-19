/**
 * Round-trip helpers for editing rich Section content as plain text.
 *
 * - Bold spans are written inline with `**double-asterisk**` markers.
 * - Paragraphs are separated by blank lines.
 */

import type { ParagraphPart } from "@/lib/section-content";

export function parseParagraphs(text: string): ParagraphPart[][] {
  return text
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map(parseParagraph);
}

export function formatParagraphs(paragraphs: ParagraphPart[][]): string {
  return paragraphs.map(formatParagraph).join("\n\n");
}

function parseParagraph(text: string): ParagraphPart[] {
  const parts: ParagraphPart[] = [];
  const re = /\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push({ strong: m[1] });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length > 0 ? parts : [text];
}

function formatParagraph(parts: ParagraphPart[]): string {
  return parts
    .map((p) => (typeof p === "string" ? p : `**${p.strong}**`))
    .join("");
}

/** Split a textarea value into a trimmed, non-empty string array. */
export function parseLines(text: string): string[] {
  return text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}
