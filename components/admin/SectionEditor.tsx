"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createSection,
  updateSection,
} from "@/lib/actions/admin-sections";
import type { SectionType } from "@prisma/client";
import {
  SECTION_TYPE_LABELS,
  contentFromForm,
  emptyForm,
  formFromContent,
  type FormShape,
} from "./section-forms";

type Props = {
  mode: "create" | "edit";
  moduleId: string;
  section?: {
    id: string;
    type: SectionType;
    number: string | null;
    title: string | null;
    content: unknown;
  };
  onDone: () => void;
};

const TYPES: SectionType[] = [
  "TEXT",
  "OBJECTIVES_BOX",
  "COMPARISON",
  "EXAMPLE_CARD",
  "PROMPT_BLOCK",
  "TRY_IT",
  "CALLOUT",
];

export function SectionEditor({ mode, moduleId, section, onDone }: Props) {
  const router = useRouter();
  const [type, setType] = useState<SectionType>(section?.type ?? "TEXT");
  const [number, setNumber] = useState(section?.number ?? "");
  const [title, setTitle] = useState(section?.title ?? "");
  const [form, setForm] = useState<FormShape[SectionType]>(() =>
    section ? formFromContent(section.type, section.content) : emptyForm("TEXT"),
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function changeType(newType: SectionType) {
    setType(newType);
    setForm(emptyForm(newType));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const content = contentFromForm(type, form);
    startTransition(async () => {
      const res =
        mode === "create"
          ? await createSection(moduleId, {
              type,
              content,
              number: number.trim() || null,
              title: title.trim() || null,
            })
          : await updateSection(section!.id, {
              content,
              number: number.trim() || null,
              title: title.trim() || null,
            });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
      onDone();
    });
  }

  return (
    <form onSubmit={onSubmit} className="rounded border border-gold bg-white p-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Section type" required>
          {mode === "create" ? (
            <select
              value={type}
              onChange={(e) => changeType(e.target.value as SectionType)}
              className="rounded-sm border border-line bg-white px-3 py-2 text-sm"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {SECTION_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          ) : (
            <input
              value={SECTION_TYPE_LABELS[type]}
              disabled
              className="rounded-sm border border-line bg-cream-deep px-3 py-2 text-sm text-muted"
            />
          )}
        </Field>
        <Field label="Number label (optional)">
          <input
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="e.g. Section 01"
            className="rounded-sm border border-line bg-white px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Heading title (optional)">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. What you'll learn"
            className="rounded-sm border border-line bg-white px-3 py-2 text-sm"
          />
        </Field>
      </div>

      <div className="mt-5 border-t border-line pt-5">
        <SectionTypeFields type={type} form={form} onChange={setForm} />
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={onDone}
          disabled={pending}
          className="text-sm text-muted hover:underline"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-sm bg-gold px-5 py-2 text-sm font-semibold uppercase tracking-wider text-navy hover:bg-navy hover:text-gold disabled:opacity-50"
        >
          {pending ? "Saving…" : mode === "create" ? "Add section" : "Save"}
        </button>
      </div>

      {error ? (
        <p className="mt-3 rounded-sm border-l-2 border-danger bg-danger-bg px-3 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </form>
  );
}

function SectionTypeFields<T extends SectionType>({
  type,
  form,
  onChange,
}: {
  type: T;
  form: FormShape[T];
  onChange: (f: FormShape[T]) => void;
}) {
  switch (type) {
    case "TEXT": {
      const f = form as FormShape["TEXT"];
      const set = (patch: Partial<FormShape["TEXT"]>) =>
        onChange({ ...f, ...patch } as FormShape[T]);
      return (
        <Field
          label="Body — paragraphs separated by blank lines; use **bold** for emphasis"
        >
          <textarea
            rows={8}
            value={f.body}
            onChange={(e) => set({ body: e.target.value })}
            placeholder="First paragraph…&#10;&#10;Second paragraph with **inline bold**."
            className="rounded-sm border border-line bg-white px-3 py-2 text-sm font-mono"
          />
        </Field>
      );
    }
    case "OBJECTIVES_BOX": {
      const f = form as FormShape["OBJECTIVES_BOX"];
      const set = (patch: Partial<FormShape["OBJECTIVES_BOX"]>) =>
        onChange({ ...f, ...patch } as FormShape[T]);
      return (
        <div className="grid gap-3">
          <Field label="Intro paragraph (optional, shown above the box)">
            <textarea
              rows={2}
              value={f.intro}
              onChange={(e) => set({ intro: e.target.value })}
              className="rounded-sm border border-line bg-white px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Box label">
            <input
              value={f.label}
              onChange={(e) => set({ label: e.target.value })}
              className="rounded-sm border border-line bg-white px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Items (one per line; **bold** supported)">
            <textarea
              rows={5}
              value={f.items}
              onChange={(e) => set({ items: e.target.value })}
              placeholder="Understand what Claude is&#10;**Always** redact client data before pasting"
              className="rounded-sm border border-line bg-white px-3 py-2 text-sm font-mono"
            />
          </Field>
        </div>
      );
    }
    case "COMPARISON": {
      const f = form as FormShape["COMPARISON"];
      const set = (patch: Partial<FormShape["COMPARISON"]>) =>
        onChange({ ...f, ...patch } as FormShape[T]);
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Bad label">
            <input
              value={f.badLabel}
              onChange={(e) => set({ badLabel: e.target.value })}
              className="rounded-sm border border-line bg-white px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Good label">
            <input
              value={f.goodLabel}
              onChange={(e) => set({ goodLabel: e.target.value })}
              className="rounded-sm border border-line bg-white px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Bad text">
            <textarea
              rows={3}
              value={f.badText}
              onChange={(e) => set({ badText: e.target.value })}
              className="rounded-sm border border-line bg-white px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Good text">
            <textarea
              rows={3}
              value={f.goodText}
              onChange={(e) => set({ goodText: e.target.value })}
              className="rounded-sm border border-line bg-white px-3 py-2 text-sm"
            />
          </Field>
          <label className="flex items-center gap-2 sm:col-span-2">
            <input
              type="checkbox"
              checked={f.mono}
              onChange={(e) => set({ mono: e.target.checked })}
              className="h-4 w-4 accent-gold"
            />
            <span className="text-sm text-navy-soft">
              Use monospace text inside the cards (good for showing literal prompts)
            </span>
          </label>
        </div>
      );
    }
    case "EXAMPLE_CARD": {
      const f = form as FormShape["EXAMPLE_CARD"];
      const set = (patch: Partial<FormShape["EXAMPLE_CARD"]>) =>
        onChange({ ...f, ...patch } as FormShape[T]);
      return (
        <div className="grid gap-3">
          <Field label="Card label">
            <input
              value={f.label}
              onChange={(e) => set({ label: e.target.value })}
              className="rounded-sm border border-line bg-white px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Intro line (optional)">
            <input
              value={f.intro}
              onChange={(e) => set({ intro: e.target.value })}
              className="rounded-sm border border-line bg-white px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Checklist items (one per line — leave blank to skip)">
            <textarea
              rows={4}
              value={f.checklist}
              onChange={(e) => set({ checklist: e.target.value })}
              className="rounded-sm border border-line bg-white px-3 py-2 text-sm font-mono"
            />
          </Field>
          <details className="rounded border border-line bg-cream-deep p-4">
            <summary className="cursor-pointer label-mono">
              Embedded prompt block (optional)
            </summary>
            <div className="mt-3 grid gap-3">
              <Field label="Caption (optional)">
                <input
                  value={f.promptCaption}
                  onChange={(e) => set({ promptCaption: e.target.value })}
                  className="rounded-sm border border-line bg-white px-3 py-2 text-sm"
                />
              </Field>
              <Field label="Prompt body">
                <textarea
                  rows={4}
                  value={f.promptBody}
                  onChange={(e) => set({ promptBody: e.target.value })}
                  className="rounded-sm border border-line bg-white px-3 py-2 text-sm font-mono"
                />
              </Field>
            </div>
          </details>
        </div>
      );
    }
    case "PROMPT_BLOCK": {
      const f = form as FormShape["PROMPT_BLOCK"];
      const set = (patch: Partial<FormShape["PROMPT_BLOCK"]>) =>
        onChange({ ...f, ...patch } as FormShape[T]);
      return (
        <div className="grid gap-3">
          <Field label="Caption (optional)">
            <input
              value={f.caption}
              onChange={(e) => set({ caption: e.target.value })}
              className="rounded-sm border border-line bg-white px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Prompt body">
            <textarea
              rows={5}
              value={f.body}
              onChange={(e) => set({ body: e.target.value })}
              className="rounded-sm border border-line bg-white px-3 py-2 text-sm font-mono"
            />
          </Field>
        </div>
      );
    }
    case "TRY_IT": {
      const f = form as FormShape["TRY_IT"];
      const set = (patch: Partial<FormShape["TRY_IT"]>) =>
        onChange({ ...f, ...patch } as FormShape[T]);
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Tag pill text">
            <input
              value={f.tag}
              onChange={(e) => set({ tag: e.target.value })}
              className="rounded-sm border border-line bg-white px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Title">
            <input
              value={f.title}
              onChange={(e) => set({ title: e.target.value })}
              className="rounded-sm border border-line bg-white px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Intro (optional)" className="sm:col-span-2">
            <input
              value={f.intro}
              onChange={(e) => set({ intro: e.target.value })}
              className="rounded-sm border border-line bg-white px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Steps (one per line)" className="sm:col-span-2">
            <textarea
              rows={5}
              value={f.steps}
              onChange={(e) => set({ steps: e.target.value })}
              className="rounded-sm border border-line bg-white px-3 py-2 text-sm font-mono"
            />
          </Field>
        </div>
      );
    }
    case "CALLOUT": {
      const f = form as FormShape["CALLOUT"];
      const set = (patch: Partial<FormShape["CALLOUT"]>) =>
        onChange({ ...f, ...patch } as FormShape[T]);
      return (
        <div className="grid gap-3">
          <Field label="Variant">
            <select
              value={f.variant}
              onChange={(e) =>
                set({
                  variant: e.target.value as "info" | "warn" | "success",
                })
              }
              className="rounded-sm border border-line bg-white px-3 py-2 text-sm"
            >
              <option value="info">Info (gold)</option>
              <option value="warn">Warning (red)</option>
              <option value="success">Success (green)</option>
            </select>
          </Field>
          <Field label="Title (optional)">
            <input
              value={f.title}
              onChange={(e) => set({ title: e.target.value })}
              className="rounded-sm border border-line bg-white px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Body">
            <textarea
              rows={3}
              value={f.body}
              onChange={(e) => set({ body: e.target.value })}
              className="rounded-sm border border-line bg-white px-3 py-2 text-sm"
            />
          </Field>
        </div>
      );
    }
  }
  return null;
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <span className="label-mono">
        {label}
        {required ? <span className="text-gold"> *</span> : null}
      </span>
      {children}
    </label>
  );
}
