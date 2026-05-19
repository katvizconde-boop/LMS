"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import { deleteSection, moveSection } from "@/lib/actions/admin-sections";
import { SectionEditor } from "./SectionEditor";
import { SECTION_TYPE_LABELS, summarizeContent } from "./section-forms";
import type { SectionType } from "@prisma/client";

type Section = {
  id: string;
  position: number;
  type: SectionType;
  number: string | null;
  title: string | null;
  content: unknown;
};

type Props = {
  moduleId: string;
  sections: Section[];
};

export function SectionList({ moduleId, sections }: Props) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onMove(id: string, dir: "up" | "down") {
    startTransition(async () => {
      await moveSection(id, dir);
      router.refresh();
    });
  }

  function onDelete(id: string) {
    if (!confirm("Delete this section?")) return;
    startTransition(async () => {
      await deleteSection(id);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {sections.length === 0 ? (
        <p className="rounded border border-dashed border-line bg-cream-deep p-6 text-center text-sm text-muted">
          No sections yet. Add one below.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {sections.map((s, i) => (
            <li key={s.id}>
              {editingId === s.id ? (
                <SectionEditor
                  mode="edit"
                  moduleId={moduleId}
                  section={s}
                  onDone={() => setEditingId(null)}
                />
              ) : (
                <div className="flex items-start gap-3 rounded border border-line bg-white p-4">
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => onMove(s.id, "up")}
                      disabled={i === 0 || pending}
                      className="rounded-sm border border-line p-1 text-muted hover:bg-cream disabled:opacity-30"
                      aria-label="Move up"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onMove(s.id, "down")}
                      disabled={i === sections.length - 1 || pending}
                      className="rounded-sm border border-line p-1 text-muted hover:bg-cream disabled:opacity-30"
                      aria-label="Move down"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                        #{s.position}
                      </span>
                      <span className="rounded-sm bg-cream-deep px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-gold">
                        {SECTION_TYPE_LABELS[s.type]}
                      </span>
                      {s.number ? (
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                          · {s.number}
                        </span>
                      ) : null}
                    </div>
                    {s.title ? (
                      <p className="mt-1 heading-serif text-lg text-navy">
                        {s.title}
                      </p>
                    ) : null}
                    <p className="mt-1 text-sm text-muted">
                      {summarizeContent(s.type, s.content)}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingId(s.id)}
                      className="font-mono text-[11px] uppercase tracking-widest text-gold underline-offset-4 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(s.id)}
                      disabled={pending}
                      className="text-danger hover:opacity-80 disabled:opacity-50"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {adding ? (
        <SectionEditor
          mode="create"
          moduleId={moduleId}
          onDone={() => setAdding(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="self-start rounded-sm bg-gold px-4 py-2 font-mono text-xs uppercase tracking-widest text-navy hover:bg-navy hover:text-gold"
        >
          + Add section
        </button>
      )}
    </div>
  );
}
