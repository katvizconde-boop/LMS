/**
 * Claude at Work — full curriculum content.
 *
 * Seven monthly modules (June – December 2026). Each module is a self-contained
 * spec the seeder upserts into the DB.
 *
 * To edit content long-term, prefer the admin Section composer at
 * `/admin/programs/[id]/modules/[mid]` — this file is the initial source.
 */

import { ModuleLevel, SectionType } from "@prisma/client";
import type {
  CalloutContent,
  ComparisonContent,
  ExampleCardContent,
  ObjectivesBoxContent,
  ParagraphPart,
  TextContent,
  TryItContent,
} from "../lib/section-content";

// ---------------- types ----------------

export type SectionInput = {
  position: number;
  number: string | null;
  title: string | null;
  type: SectionType;
  content: unknown;
};

export type QuizInput = {
  position: number;
  question: string;
  options: string[];
  correctIndex: number;
  feedback: string;
};

export type ExerciseInput = {
  title: string;
  instructions: {
    intro?: string;
    steps: string[];
    deadlineNote?: string;
  };
};

export type ModuleSpec = {
  position: number;
  number: string;
  title: string;
  subtitle: string;
  heroSubtitle: string;
  level: ModuleLevel;
  durationMinutes: number;
  audienceLabel: string;
  availableFrom: Date;
  learningObjectives: string[];
  sections: () => SectionInput[];
  quizzes: () => QuizInput[];
  exercise: ExerciseInput | null;
};

export type ProgramSpec = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  startDate: Date;
  endDate: Date | null;
  audienceRules: object;
  modules: ModuleSpec[];
};

// ---------------- text helpers ----------------

export function p(...parts: ParagraphPart[]): ParagraphPart[] {
  return parts;
}
export function s(text: string) {
  return { strong: text };
}

// Each section uses a small counter so positions stay in order without manual math.
export function makeCounter() {
  let pos = 0;
  return () => ++pos;
}

// ============================================================
// MODULE 01 — Meet Claude.
// ============================================================

function module01(): ModuleSpec {
  const next = makeCounter();
  return {
    position: 1,
    number: "01",
    title: "Meet Claude.",
    subtitle:
      "What Claude is, how to talk to it, and how to use it safely with company work.",
    heroSubtitle:
      "Your first step into working with AI — what Claude actually is, how to talk to it, and how to use it safely with company and client work.",
    level: ModuleLevel.FOUNDATION,
    durationMinutes: 35,
    audienceLabel: "Pilot · Finance + HR",
    availableFrom: new Date("2026-06-01T00:00:00Z"),
    learningObjectives: [
      "Understand what Claude is — and what it isn't",
      "Access Claude through your company-approved account",
      "Hold your first useful conversation with Claude",
      "Know what work you can and cannot put into Claude",
      "Recognize when Claude is wrong (yes, it happens)",
    ],
    sections: () => [
      {
        position: next(),
        number: "Section 01",
        title: "What you'll learn",
        type: SectionType.OBJECTIVES_BOX,
        content: {
          intro:
            "This is a foundation module. By the end of it, you'll be able to log into Claude, hold a productive first conversation, and understand the rules of the road when using it with Seven Generation work.",
          label: "Learning Objectives",
          items: [
            "Understand what Claude is — and what it isn't",
            "Access Claude through your company-approved account",
            "Hold your first useful conversation with Claude",
            "Know what work you can and cannot put into Claude",
            "Recognize when Claude is wrong (yes, it happens)",
          ],
        } satisfies ObjectivesBoxContent,
      },
      {
        position: next(),
        number: "Section 02",
        title: "So, what is Claude?",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Claude is an AI assistant made by a company called Anthropic. You can talk to it the same way you'd message a colleague — typing questions, sharing documents, asking for help — and it responds in plain English (or Filipino, or Taglish — it understands all of them).",
            ),
            p(
              s("Think of Claude as a very fast, very knowledgeable assistant"),
              " who has read most of the internet up to early 2026, never gets tired, never judges your \"stupid\" questions, and can help with writing, research, analysis, brainstorming, and almost any text-based task.",
            ),
            p(
              "But — and this matters — Claude is not magic, not always right, and not a replacement for your professional judgment. It's a tool. A powerful one. You're the one driving.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.COMPARISON,
        content: {
          goodLabel: "✓ What Claude is good at",
          goodText:
            "Drafting, summarizing, brainstorming, explaining, structuring messy thoughts, second-pair-of-eyes review, translating, formatting",
          badLabel: "✗ What Claude isn't",
          badText:
            "A live search engine, a calculator for confidential math, a source of real-time prices, a replacement for legal or financial advice, infallible",
        } satisfies ComparisonContent,
      },
      {
        position: next(),
        number: "Section 03",
        title: "Accessing Claude at Seven Generation",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Seven Generation uses Claude as our standardized AI assistant across M2.0 Communications, Media Meter, and Rythmos DB. Before using it for work, make sure you're using the ",
              s("company-provided account"),
              " — not a personal account.",
            ),
            p(
              "Why this matters: company accounts give us data protection, conversation history that stays inside the organization, and the right licensing tier for the work you do.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "Quick Setup Checklist",
          checklist: [
            "Receive your account credentials from 7gen IT",
            "Log in at claude.ai using your work email",
            "Bookmark the page",
            "Read the Acceptable Use Policy (linked in your onboarding email)",
            "Send your first \"hello\" — you're in!",
          ],
        } satisfies ExampleCardContent,
      },
      {
        position: next(),
        number: "Section 04",
        title: "Your first real conversation",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "The biggest mistake new users make is treating Claude like Google. Don't type one-word searches. Talk to it like you'd talk to a smart, eager intern who just walked into your office.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.COMPARISON,
        content: {
          mono: true,
          badLabel: "✗ Don't do this",
          badText: '"press release sample"',
          goodLabel: "✓ Do this",
          goodText:
            '"Draft a 250-word press release announcing our client\'s new product launch. Tone should be professional but conversational. Target audience: tech journalists in the Philippines."',
        } satisfies ComparisonContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "The second one gets you something usable in 30 seconds. The first one gets you something generic that takes 10 more rounds of editing.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "Try this exact prompt",
          intro: "Copy this into Claude as your first message:",
          promptBlock: {
            body: "Hi Claude. I work at Seven Generation Group — we run a communications agency (M2.0), a media monitoring company (Media Meter), and a data company (Rythmos DB). I'm just learning how to use you. Can you give me 5 examples of work tasks you could help me with — written in plain language, no jargon?",
          },
        } satisfies ExampleCardContent,
      },
      {
        position: next(),
        number: "Section 05",
        title: "Using Claude safely with company work",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "This is the most important section of this module. Read it twice.",
            ),
            p(
              "Claude is a powerful tool, but anything you put into it leaves your screen. Before pasting any document, ask yourself: ",
              s("\"Would I email this to someone outside our group?\""),
              " If the answer is no, don't put it into Claude without checking with your manager or 7gen IT first.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.OBJECTIVES_BOX,
        content: {
          label: "The Three Always Rules",
          items: [
            "**Always** remove client names, NDA-protected details, and personal data (SSS, TIN, salaries) before pasting",
            "**Always** verify any fact, statistic, or quote Claude gives you before publishing — Claude can confidently make things up",
            "**Always** disclose AI assistance to your manager when the deliverable is client-facing or going to leadership",
          ],
        } satisfies ObjectivesBoxContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "If you're unsure whether something is okay to share with Claude, the safe answer is: ",
              s("ask first, paste later"),
              ".",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.TRY_IT,
        content: {
          tag: "Practice",
          title: "Try it yourself — 10 minutes",
          intro: "Open Claude in a new tab and try this exercise:",
          steps: [
            'Send Claude the prompt from Section 04 (the "hi Claude" one)',
            "Read its 5 suggestions. Pick the one closest to your actual job.",
            "Ask Claude to walk you through how it would help you with that task",
            "Ask a follow-up question. Then another. See how the conversation builds.",
          ],
        } satisfies TryItContent,
      },
    ],
    quizzes: () => [
      {
        position: 1,
        question:
          "A teammate asks Claude to summarize a confidential client contract. What's the right call?",
        options: [
          "Go ahead — Claude is private",
          "Send it as long as you delete the chat after",
          "Remove client names and confidential details first, or ask your manager",
          "Print it and read it yourself instead",
        ],
        correctIndex: 2,
        feedback:
          "Anything confidential needs review or redaction before going into Claude. Deleting a chat doesn't undo data already sent.",
      },
      {
        position: 2,
        question: "Which prompt will give you a better result?",
        options: [
          '"email apology"',
          '"Draft a 3-paragraph email apologizing to a client for a delayed deliverable, professional tone, offer a revised timeline"',
          '"write apology fast"',
          '"sorry email please"',
        ],
        correctIndex: 1,
        feedback:
          "Specificity — length, tone, audience, what to include — is what separates a useful response from a generic one.",
      },
      {
        position: 3,
        question:
          "Claude tells you a statistic about Philippine media consumption. You're about to put it in a client deck. What do you do?",
        options: [
          "Use it — Claude is trained on a lot of data",
          "Verify it from an original source before using it",
          "Ask Claude if it's sure",
          'Cite "Claude AI" as the source',
        ],
        correctIndex: 1,
        feedback:
          'Claude can confidently produce inaccurate facts (this is called "hallucination"). Statistics, quotes, and dates must always be verified from primary sources before publication.',
      },
    ],
    exercise: {
      title: "Module 01 — Submission",
      instructions: {
        steps: [
          "Have one real conversation with Claude about a current work task — keep it under 15 minutes",
          "In 3–5 sentences, describe: what task you tried, what Claude got right, and where it fell short",
          "Note one thing you'd do differently next time",
          "Submit to your manager via email or the form linked in your invitation",
        ],
        deadlineNote: "Deadline: end of June 2026",
      },
    },
  };
}

// ============================================================
// MODULE 02 — Prompting Basics
// ============================================================

function module02(): ModuleSpec {
  const next = makeCounter();
  return {
    position: 2,
    number: "02",
    title: "Prompting Basics.",
    subtitle:
      "Context, clarity, structure — and the common mistakes that waste your time.",
    heroSubtitle:
      "Now that you've met Claude, learn the simple shape that turns a vague question into a useful answer — the first time.",
    level: ModuleLevel.FOUNDATION,
    durationMinutes: 40,
    audienceLabel: "Pilot · Finance + HR",
    availableFrom: new Date("2026-06-04T00:00:00Z"),
    learningObjectives: [
      "Structure a request with audience, goal, constraints, and format",
      "Use specificity instead of length to get sharper answers",
      "Give Claude an example when words alone don't capture what you want",
      "Iterate on a response without starting the whole conversation over",
    ],
    sections: () => [
      {
        position: next(),
        number: "Section 01",
        title: "What you'll learn",
        type: SectionType.OBJECTIVES_BOX,
        content: {
          intro:
            "Module 01 was about meeting Claude. This one is about being understood the first time. A good prompt has four small ingredients — once you start including them out of habit, you'll spend less time editing and more time finishing.",
          label: "Learning Objectives",
          items: [
            "Structure a request with the 4-part recipe",
            "Use specificity to replace endless follow-up rounds",
            "Anchor with an example when describing isn't enough",
            "Iterate inside one conversation instead of starting over",
          ],
        } satisfies ObjectivesBoxContent,
      },
      {
        position: next(),
        number: "Section 02",
        title: "The 4-part recipe",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Most prompts that go wrong are missing something obvious. The fix isn't writing more — it's writing the ",
              s("right four things"),
              ". When you give Claude all four, the first response is usually 80% of the way there.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.OBJECTIVES_BOX,
        content: {
          label: "Context · Goal · Constraints · Format",
          items: [
            "**Context** — who you are, who the reader is, what came before",
            "**Goal** — what you want the deliverable to do (inform? persuade? apologize?)",
            "**Constraints** — length, tone, things to avoid, things to include",
            "**Format** — bullet list, table, full paragraph, email, deck slide",
          ],
        } satisfies ObjectivesBoxContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "A 4-part prompt in the wild",
          intro:
            "Here's the same request with all four ingredients folded in — try it:",
          promptBlock: {
            body: "I'm an M2.0 account manager writing a status update for a tech client (Context). I need to explain that we're pushing the press release deadline by one week without sounding evasive (Goal). Keep it to 4 sentences, professional but warm, no apologies more than once (Constraints). Format as a Slack message I can paste directly (Format).",
          },
        } satisfies ExampleCardContent,
      },
      {
        position: next(),
        number: "Section 03",
        title: "Specificity beats brevity",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "New users often try to be ",
              s("efficient"),
              " by writing short prompts. It backfires. A 5-word prompt makes Claude guess; a 50-word prompt removes the guessing.",
            ),
            p(
              "The trade is simple: 30 extra seconds typing vs. 5 rounds of \"no, more like this.\" Specificity is faster.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.COMPARISON,
        content: {
          mono: true,
          badLabel: "✗ Vague",
          badText: '"summarize this article"',
          goodLabel: "✓ Specific",
          goodText:
            '"Summarize this article in 5 bullet points for a non-technical executive — focus on business implications, skip the methodology, keep it under 80 words."',
        } satisfies ComparisonContent,
      },
      {
        position: next(),
        number: "Section 04",
        title: "When words aren't enough, show an example",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Some things are hard to describe in words but easy to recognize. Tone is the big one. \"Professional but warm\" means different things to different people. ",
              s("Paste an example of how YOU would write it"),
              ", and Claude will match the pattern.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "Anchor with a sample",
          intro: "Paste one previous email you wrote, then ask for more like it:",
          promptBlock: {
            body: "Here's an email I sent last week:\n\n[paste your actual email here]\n\nWrite a new one for [new situation] in the same voice — same length, same level of formality, same way I open and close.",
          },
        } satisfies ExampleCardContent,
      },
      {
        position: next(),
        number: "Section 05",
        title: "Iterate, don't restart",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "If Claude's first reply isn't quite right, ",
              s("don't open a new chat"),
              ". Keep the same conversation and tell it what to change. It remembers everything you've discussed and can adjust without losing the thread.",
            ),
            p(
              "Good iteration prompts: \"Shorter.\" \"More formal.\" \"Cut the second paragraph.\" \"Now write it from the client's perspective.\" Tiny corrections, big improvements.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.TRY_IT,
        content: {
          tag: "Practice",
          title: "Try it yourself — 15 minutes",
          intro:
            "Pick one real piece of writing on your plate this week. Draft it with Claude using the 4-part recipe:",
          steps: [
            "Open a fresh Claude chat",
            "Write your prompt covering Context, Goal, Constraints, Format — out loud, even if it feels like overkill",
            "Read the first reply. If it's not right, give one small correction (e.g. \"shorter\" or \"more direct\")",
            "Iterate 2–3 more rounds without starting over",
            "Notice how few rounds it took compared to last time",
          ],
        } satisfies TryItContent,
      },
    ],
    quizzes: () => [
      {
        position: 1,
        question: "Which of these is the most complete prompt?",
        options: [
          '"meeting notes summary"',
          '"summarize meeting notes for my manager"',
          '"Summarize the meeting notes below into a 5-bullet action list for my manager. Tone: neutral. Skip introductions. Format: bullets, each starting with a verb."',
          '"please summarize"',
        ],
        correctIndex: 2,
        feedback:
          "All four ingredients: context (notes below, for manager), goal (action list), constraints (5 bullets, neutral tone, no intro), and format (bullets starting with a verb).",
      },
      {
        position: 2,
        question:
          "Claude's first draft of an email is too formal. What's the most efficient next move?",
        options: [
          "Start a new chat and write a different prompt",
          'Reply in the same chat with: "Make it less formal — drop the corporate language, write like you would to a colleague"',
          "Manually rewrite the whole thing yourself",
          "Ask Claude what it thinks formal means",
        ],
        correctIndex: 1,
        feedback:
          "Iterate inside the same conversation. Claude remembers the context and can adjust quickly. New chats lose that thread.",
      },
      {
        position: 3,
        question:
          "You're asking Claude to write in your team's house style. Words alone aren't capturing it. What's the best fix?",
        options: [
          "Try harder to describe the style in words",
          "Paste 1–2 examples of how you've written before and ask Claude to match the pattern",
          "Send Claude your company's style guide PDF without explanation",
          "Use a longer adjective list (e.g. \"warm, professional, friendly, approachable, conversational\")",
        ],
        correctIndex: 1,
        feedback:
          "Examples beat adjectives. Pasting a real piece of writing gives Claude a concrete pattern to match instead of guessing at vibes.",
      },
    ],
    exercise: {
      title: "Module 02 — Submission",
      instructions: {
        intro: "Pick a real writing task on your plate this week.",
        steps: [
          "Write your prompt using the 4-part recipe (context, goal, constraints, format)",
          "Get Claude's first draft. Iterate 2–3 rounds without starting over.",
          "Paste your final prompt + the final response into your submission",
          "In 2–3 sentences: what was different from your usual prompting?",
        ],
        deadlineNote: "Deadline: end of July 2026",
      },
    },
  };
}

// ============================================================
// MODULE 03 — Working with Documents
// ============================================================

function module03(): ModuleSpec {
  const next = makeCounter();
  return {
    position: 3,
    number: "03",
    title: "Working with Documents.",
    subtitle:
      "Summarize, extract, translate, redact — the four moves that save you the most hours.",
    heroSubtitle:
      "Documents are where Claude saves you the most time. Learn how to summarize, extract, and translate — and what to redact before pasting.",
    level: ModuleLevel.FOUNDATION,
    durationMinutes: 40,
    audienceLabel: "Pilot · Finance + HR",
    availableFrom: new Date("2026-06-08T00:00:00Z"),
    learningObjectives: [
      "Paste or upload a document and ask for a focused summary",
      "Extract structured info (tables, action items, key facts) from messy text",
      "Translate and tone-shift between English, Filipino, and Taglish",
      "Redact sensitive content before any of this",
    ],
    sections: () => [
      {
        position: next(),
        number: "Section 01",
        title: "What you'll learn",
        type: SectionType.OBJECTIVES_BOX,
        content: {
          intro:
            "Most office time is spent reading documents you'd rather skim and writing documents you'd rather summarize. This module covers the four moves that turn that into 10 minutes of work instead of 90.",
          label: "Learning Objectives",
          items: [
            "Summarize with the kind of summary you actually want",
            "Pull structured info out of unstructured text",
            "Translate between English, Filipino, and Taglish",
            "Redact first — every time",
          ],
        } satisfies ObjectivesBoxContent,
      },
      {
        position: next(),
        number: "Section 02",
        title: "Redact first. Always.",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Before any of the techniques below, do the redaction pass. Module 01's Three Always Rules apply harder when you're pasting whole documents — there's more surface area for sensitive bits to slip in.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.OBJECTIVES_BOX,
        content: {
          label: "The Redaction Sweep — 30 seconds before you paste",
          items: [
            "**Client names** — replace with [CLIENT], [PRODUCT], [BRAND]",
            "**Personal data** — SSS, TIN, salary, home address, family info",
            "**NDA-protected** — financials, unannounced launches, partnership terms",
            "**Internal-only** — employee feedback, IC discussions, vendor disputes",
          ],
        } satisfies ObjectivesBoxContent,
      },
      {
        position: next(),
        number: "Section 03",
        title: "Summarize — but tell Claude what kind",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "\"Summarize this\" is the vaguest prompt in the world. There are at least five different summaries Claude could produce, and only one is what you actually want.",
            ),
            p(
              s("Name the summary you want"),
              ". Executive brief? Action list? Skim for facts? Friendly recap to forward to the team? Each has a different shape.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.COMPARISON,
        content: {
          badLabel: "✗ Will get you anything",
          badText:
            '"Summarize this report" — what you get is roulette: maybe a 300-word recap, maybe 12 bullets, maybe a tweet. None of them match what your manager asked for.',
          goodLabel: "✓ Will get you what you wanted",
          goodText:
            '"Summarize this report into a 4-bullet executive brief. Each bullet: 1 sentence, action-oriented, no jargon. Focus on what changes for our team."',
        } satisfies ComparisonContent,
      },
      {
        position: next(),
        number: "Section 04",
        title: "Extract structured info from messy text",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Need a list of names, dates, deliverables, action items, or quotes — buried in a wall of meeting notes? Claude is excellent at this. The trick is to ",
              s("describe the shape you want"),
              " before pasting the mess.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "Extraction pattern",
          intro: "Tell Claude the structure first, then paste:",
          promptBlock: {
            body: "Read the meeting notes below and extract a table with these columns: Action Item | Owner | Due Date | Priority (H/M/L). One row per action. Anything not clearly assigned, mark Owner as TBD.\n\n[paste meeting notes]",
          },
        } satisfies ExampleCardContent,
      },
      {
        position: next(),
        number: "Section 05",
        title: "Translate and tone-shift",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Claude handles English, Filipino, and Taglish smoothly — and not just \"correct\" translations. It can ",
              s("shift tone in the same language"),
              ": casual to formal, technical to plain, long-form to client-ready.",
            ),
            p(
              "Useful for: forwarding an English brief to a Filipino-speaking field team, polishing a Taglish Slack thread into a formal client memo, or softening a sharp internal email before it goes to leadership.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.COMPARISON,
        content: {
          badLabel: "✗ Sharp",
          badText:
            "\"The vendor missed the deadline. We need a new quote by Friday or we're moving on.\"",
          goodLabel: "✓ Same message, softened",
          goodText:
            "\"Following up on the timeline — we'd like to lock down a final quote by Friday so we can plan accordingly. If that's not workable, please let us know so we can adjust on our end.\"",
        } satisfies ComparisonContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.TRY_IT,
        content: {
          tag: "Practice",
          title: "Try it yourself — 15 minutes",
          intro: "Pick a real document from your work this week. (Redact first!)",
          steps: [
            "Find a meeting note, brief, or report you actually need to process",
            "Do the 30-second redaction sweep — replace client names and personal data",
            "Pick ONE move: summary OR extraction OR tone-shift",
            "Write a 4-part prompt that names what you want",
            "Compare time spent vs. doing it manually",
          ],
        } satisfies TryItContent,
      },
    ],
    quizzes: () => [
      {
        position: 1,
        question:
          "You need to summarize a 12-page client report for your director's 30-second skim. Best prompt?",
        options: [
          '"summarize this"',
          '"give me a tldr"',
          '"Summarize this client report into 3 sentences for an executive who has 30 seconds — only what changes for our team. No client name needed."',
          '"shorter version please"',
        ],
        correctIndex: 2,
        feedback:
          "Naming the shape (3 sentences), the audience (executive, 30 seconds), and the angle (what changes for us) gets you a summary you can actually use the first try.",
      },
      {
        position: 2,
        question:
          "You're about to paste a client contract into Claude to get a summary. What do you do first?",
        options: [
          "Hit paste — it'll be fine, you're just summarizing",
          "Replace client names, financial figures, and NDA-protected sections with placeholders like [CLIENT] and [AMOUNT]",
          "Email your manager to ask for permission, then paste",
          "Print the contract and summarize by hand",
        ],
        correctIndex: 1,
        feedback:
          "Redaction is the 30-second habit. Generic placeholders preserve the structure so Claude can still summarize meaningfully, without exposing client-protected details.",
      },
      {
        position: 3,
        question:
          "Your meeting notes are 4 pages of bullet points. You want a clean action-item table. What's the move?",
        options: [
          "Read the whole thing yourself and make the table in Excel",
          "Paste into Claude and say \"clean this up\"",
          "Paste into Claude after telling it the exact columns you want (Action / Owner / Due Date / Priority)",
          "Email the team to fill out a tracking sheet",
        ],
        correctIndex: 2,
        feedback:
          "Describe the table structure BEFORE you paste. Claude returns a clean grid you can paste straight into Sheets — much faster than 'clean this up'.",
      },
    ],
    exercise: {
      title: "Module 03 — Submission",
      instructions: {
        intro: "Run one of the three moves on a real document.",
        steps: [
          "Pick a real document (meeting notes, brief, report, email thread)",
          "Run the redaction sweep — replace anything client-sensitive or personal",
          "Use Claude to summarize OR extract OR tone-shift",
          "Submit: the prompt you used + your reflection on time saved vs. manual",
        ],
        deadlineNote: "Deadline: end of August 2026",
      },
    },
  };
}

// ============================================================
// MODULE 04 — Research & Verification
// ============================================================

function module04(): ModuleSpec {
  const next = makeCounter();
  return {
    position: 4,
    number: "04",
    title: "Research & Verification.",
    subtitle:
      "Claude as a research starting point — and the verification rhythm that protects you from confident wrong answers.",
    heroSubtitle:
      "Claude is fast at research and sometimes wrong with conviction. Learn the verification rhythm that separates a useful draft from an embarrassing publish.",
    level: ModuleLevel.INTERMEDIATE,
    durationMinutes: 45,
    audienceLabel: "Pilot · Finance + HR",
    availableFrom: new Date("2026-06-11T00:00:00Z"),
    learningObjectives: [
      "Use Claude to brainstorm and structure a research path",
      "Ask for sources — and know what those sources can and can't tell you",
      "Recognize hallucination patterns (over-confident dates, made-up quotes, fake statistics)",
      "Apply the verification checklist before anything client-facing",
    ],
    sections: () => [
      {
        position: next(),
        number: "Section 01",
        title: "What you'll learn",
        type: SectionType.OBJECTIVES_BOX,
        content: {
          intro:
            "Claude can do in 3 minutes what would take you an hour of Googling — but it can also fabricate a perfectly-formatted citation that doesn't exist. This module is about getting the speed-up without the embarrassment.",
          label: "Learning Objectives",
          items: [
            "Treat Claude as a research starting point, not the endpoint",
            "Recognize the four tells of a hallucinated answer",
            "Verify every fact, quote, and statistic before publishing",
            "Ask for sources in a way Claude can answer honestly",
          ],
        } satisfies ObjectivesBoxContent,
      },
      {
        position: next(),
        number: "Section 02",
        title: "Starting point, not endpoint",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Claude is great at the ",
              s("opening half"),
              " of research — telling you what to look for, suggesting angles, sketching the landscape. It's much weaker at the closing half — confirming what's actually true today.",
            ),
            p(
              "The rule: use Claude to know what questions to ask, then use primary sources to answer them.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.COMPARISON,
        content: {
          badLabel: "✗ Treating Claude as the source",
          badText:
            "\"What's the current ad spend share of Philippine FMCG brands?\" — and using whatever number it gives in your deck",
          goodLabel: "✓ Treating Claude as the scout",
          goodText:
            "\"What sources should I check for current Philippine FMCG ad spend share, and what specific reports usually cover this?\" — then pulling the real numbers from those sources",
        } satisfies ComparisonContent,
      },
      {
        position: next(),
        number: "Section 03",
        title: "Hallucinations — and how to spot them",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "\"Hallucination\" is the polite word for when Claude makes things up. It doesn't lie on purpose — it generates plausible-sounding text and sometimes the plausible-sounding text is fabricated. The trick is knowing the smell.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.OBJECTIVES_BOX,
        content: {
          label: "The Four Hallucination Tells",
          items: [
            "**Suspicious specificity** — a precise percentage, page number, or date with no source you can find",
            "**Confident citations of recent events** — Claude's training has a cutoff; \"in 2026\" claims are a yellow flag",
            "**Quotes attributed to real people** — almost always paraphrased, often invented entirely",
            "**Round-number statistics that don't compound** — 60% of A, 70% of B, 80% of C — too clean to be real",
          ],
        } satisfies ObjectivesBoxContent,
      },
      {
        position: next(),
        number: "Section 04",
        title: "Ask for sources — the right way",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Asking \"can you cite sources?\" often makes things worse — Claude generates plausible-looking URLs that don't exist. Ask differently: ",
              s("what kind of source would this come from"),
              ", and ",
              s("how confident are you in this specific claim"),
              ".",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "A source-asking prompt that works",
          intro: "Instead of \"cite your sources,\" ask this:",
          promptBlock: {
            body: "For each claim above, tell me: (1) what kind of source typically reports this (e.g. government agency, industry body, academic paper), (2) how confident you are on a 1-5 scale, and (3) whether the claim is likely to have changed in the last 12 months. Don't invent URLs — just describe the source type.",
          },
        } satisfies ExampleCardContent,
      },
      {
        position: next(),
        number: "Section 05",
        title: "The verification checklist",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Before anything client-facing or going to leadership, run this checklist on every fact, statistic, quote, and named source. Two minutes per claim — much cheaper than a published mistake.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.OBJECTIVES_BOX,
        content: {
          label: "Verify Before You Publish",
          items: [
            "**Every statistic** — find the same number in a primary source (government, industry report, academic paper)",
            "**Every quote** — find the original, in context",
            "**Every named person, company, or date** — confirm spelling, role, and timing",
            "**Every URL** — open it. If it 404s, it was made up.",
          ],
        } satisfies ObjectivesBoxContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.CALLOUT,
        content: {
          variant: "warn",
          title: "If you can't verify it, you can't publish it.",
          body: "When in doubt, leave it out. \"Industry estimates suggest…\" with no source is worse than no statistic at all. Reputation is much harder to rebuild than research is to redo.",
        } satisfies CalloutContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.TRY_IT,
        content: {
          tag: "Practice",
          title: "Try it yourself — 20 minutes",
          intro:
            "Run Claude on a small research task you'd actually do at work, then verify everything:",
          steps: [
            "Pick a real research question from your work this month",
            "Ask Claude to research it AND to apply the confidence/source-type rubric above",
            "Pick the 3 most useful claims from its answer",
            "Verify each one against a primary source — note which held up, which didn't",
            "Reflect: how many of the claims were trustworthy as-is?",
          ],
        } satisfies TryItContent,
      },
    ],
    quizzes: () => [
      {
        position: 1,
        question:
          "Claude gives you a precise number: \"63.7% of Filipino consumers prefer mobile-first brands.\" What's your first move?",
        options: [
          "Use it — the precision suggests it's from a real source",
          "Ask Claude where the number comes from",
          "Treat it as a hypothesis and look for the same statistic in a primary source",
          "Round it to 64% and use it anyway",
        ],
        correctIndex: 2,
        feedback:
          "Suspicious specificity is a hallucination tell. Precise percentages with no traceable source are red flags. Treat as hypothesis, verify against an industry or government source before using.",
      },
      {
        position: 2,
        question:
          "Which approach gets you the most reliable research output?",
        options: [
          "Ask Claude for the answer and copy it into your deck",
          "Ask Claude what sources to consult, then read those sources yourself",
          "Ask Claude for the answer plus URLs to its sources",
          "Ask Claude to search the web for you",
        ],
        correctIndex: 1,
        feedback:
          "Claude is best as a scout — pointing you at sources to check. URLs it generates may not exist. Primary sources answer the actual question.",
      },
      {
        position: 3,
        question:
          "Claude attributes a punchy one-liner to a named Philippine business leader. You're about to drop it into a client thought-leadership piece. What do you do?",
        options: [
          "Use it — Claude wouldn't make up a real person's quote",
          'Hedge it: "as has been said by industry leaders…"',
          "Search the exact phrase in quotes online; if you can't find it published anywhere, don't use it",
          "Slightly reword it so it's not exactly the same",
        ],
        correctIndex: 2,
        feedback:
          'Quotes attributed to real people are one of the highest-risk hallucinations. If the exact phrase isn\'t findable in published material, assume it was fabricated. Misattributing a quote is a reputational hit.',
      },
    ],
    exercise: {
      title: "Module 04 — Submission",
      instructions: {
        intro: "Do a real research task with Claude. Then verify.",
        steps: [
          "Pick a research question relevant to your current work",
          "Use Claude to scope it: angles to consider, source types to check",
          "Pick the 3 most important claims Claude offered",
          "Verify each against a primary source. Note which held up.",
          "Submit: your research question, the 3 claims, and your verification notes",
        ],
        deadlineNote: "Deadline: end of September 2026",
      },
    },
  };
}

// ============================================================
// MODULE 05 — Writing on the Job
// ============================================================

function module05(): ModuleSpec {
  const next = makeCounter();
  return {
    position: 5,
    number: "05",
    title: "Writing on the Job.",
    subtitle:
      "Emails, briefs, releases, internal memos — drafting fast without sounding like AI.",
    heroSubtitle:
      "The biggest writing wins are the short, repeated tasks: emails, briefs, internal notes. Learn the patterns that produce drafts that sound like you — not like a chatbot.",
    level: ModuleLevel.INTERMEDIATE,
    durationMinutes: 45,
    audienceLabel: "All employees — M2, MMI, RDB",
    availableFrom: new Date("2026-06-15T00:00:00Z"),
    learningObjectives: [
      "Anchor Claude to your house tone with a single example",
      "Choose between drafting from scratch vs. polishing your rough draft",
      "Spot the AI tells (hedging, em-dash overuse, generic flattery) and rewrite past them",
      "Match the writing to the channel — email, Slack, deck, press release",
    ],
    sections: () => [
      {
        position: next(),
        number: "Section 01",
        title: "What you'll learn",
        type: SectionType.OBJECTIVES_BOX,
        content: {
          intro:
            "Writing is where most people first feel the speed-up — and also where AI sounds the most like AI. This module is about getting drafts in 30 seconds that sound like a person you'd want to work with.",
          label: "Learning Objectives",
          items: [
            "Anchor tone with one real example of your own writing",
            "Know when to draft fresh vs. polish your own rough cut",
            "Recognize and rewrite past the AI tells",
            "Match register to the channel — Slack ≠ email ≠ press release",
          ],
        } satisfies ObjectivesBoxContent,
      },
      {
        position: next(),
        number: "Section 02",
        title: "Anchor your tone with one example",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "The fastest fix for \"sounds like AI\" is to paste a single piece of your own writing as a reference. Claude is excellent at mimicking patterns — far better than at interpreting adjectives like \"warm but professional.\"",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "The anchor pattern",
          intro: "Use this template for any writing task in your voice:",
          promptBlock: {
            body: "Here's an email I wrote last week:\n\n[paste your actual email — 1 paragraph is enough]\n\nUsing the same voice — same opener, same level of formality, same way I make requests — write me a new email for this situation: [describe new situation in 2 sentences].",
          },
        } satisfies ExampleCardContent,
      },
      {
        position: next(),
        number: "Section 03",
        title: "Draft fresh vs. polish your draft",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Two workflows. ",
              s("Draft fresh"),
              ": you describe what you want, Claude writes it, you edit. ",
              s("Polish yours"),
              ": you write a rough version yourself, then ask Claude to tighten it. Both work — but they win at different things.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.COMPARISON,
        content: {
          badLabel: "✗ Draft fresh wins when…",
          badText:
            "You don't know how to start, or it's a kind of writing you don't normally do (e.g. a formal apology, a sympathy note, a deck intro)",
          goodLabel: "✓ Polish yours wins when…",
          goodText:
            "You already know what to say but your first draft is too long, too sharp, or just rough — Claude smooths edges without changing meaning",
        } satisfies ComparisonContent,
      },
      {
        position: next(),
        number: "Section 04",
        title: "The AI tells — and how to rewrite past them",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Even with good prompts, Claude has habits. They're easy to spot once you know them, and easy to remove. Three or four small edits per draft is usually all it takes.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.OBJECTIVES_BOX,
        content: {
          label: "Common AI Tells",
          items: [
            "**Em-dash overuse** — three em-dashes per paragraph is a giveaway",
            "**Hedging openers** — \"It's worth noting that…\" / \"It's important to remember…\"",
            "**Generic flattery** — \"That's a great question!\" / \"Excellent point.\"",
            "**Listy answers when prose was asked for** — bullet points where a sentence would do",
            "**Closing summaries that repeat what was just said** — \"In summary, [restates everything].\"",
          ],
        } satisfies ObjectivesBoxContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Easy rewrite move: ",
              s("ask Claude to remove them directly"),
              ". \"Rewrite this without any em-dashes, hedging openers, or closing summaries. Treat it as one short paragraph.\" Works almost every time.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: "Section 05",
        title: "Match the channel",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Same idea, different channels, very different writing. A Slack message that reads like a press release is annoying; a press release that reads like a Slack message is unprofessional. Tell Claude where this will live.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.COMPARISON,
        content: {
          badLabel: "✗ Same content, wrong channel",
          badText:
            "\"We are pleased to announce that, after careful consideration, our team has reached the decision to extend the project timeline by one week.\" — pasted into Slack",
          goodLabel: "✓ Slack-native",
          goodText:
            "\"Heads up — we're pushing the timeline by a week. I'll send the new dates in a sec.\"",
        } satisfies ComparisonContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.TRY_IT,
        content: {
          tag: "Practice",
          title: "Try it yourself — 15 minutes",
          intro: "Write one real email or Slack message using the anchor pattern:",
          steps: [
            "Find one piece of your own writing — an email, a Slack message, anything you wrote in your real voice",
            "Use the anchor pattern (paste your sample + describe the new situation)",
            "After Claude drafts it, scan for the AI tells — em-dashes, hedging, closing summaries",
            "Ask Claude to rewrite without those tells",
            "Compare to what you would have written manually",
          ],
        } satisfies TryItContent,
      },
    ],
    quizzes: () => [
      {
        position: 1,
        question:
          "Your Claude-drafted email starts with \"It's worth noting that…\" and ends with \"In summary, the deadline is Friday.\" What's the most efficient fix?",
        options: [
          "Manually rewrite the opening and closing yourself",
          'Reply: "Rewrite without hedging openers or closing summaries — keep it to 3 sentences"',
          "Accept it — the meaning is clear",
          "Start a whole new chat with a stricter prompt",
        ],
        correctIndex: 1,
        feedback:
          "Just ask. Claude can edit out its own tells in one round when you name them. Faster than hand-rewriting.",
      },
      {
        position: 2,
        question:
          "You have a sharp internal email that needs softening before going to a client. What's the better workflow?",
        options: [
          "Draft fresh with Claude — describe the situation, let it write from scratch",
          "Polish yours — paste your version and ask Claude to soften the tone without changing the message",
          "Have your manager rewrite it",
          "Send the sharp version — they'll appreciate directness",
        ],
        correctIndex: 1,
        feedback:
          "When you already know what to say, polish-yours preserves your meaning and just smooths edges. Draft-fresh is for when you don't yet have the content.",
      },
      {
        position: 3,
        question:
          "Which Claude output reads most like a Slack message (vs. an email)?",
        options: [
          '"Dear team, I hope this message finds you well. I wanted to bring to your attention…"',
          "\"Hey — quick one: the deadline moved to Friday. Will send the updated brief shortly.\"",
          '"Pleased to inform you that the deadline has been adjusted to Friday, with further details forthcoming."',
          "All three sound the same",
        ],
        correctIndex: 1,
        feedback:
          "Slack rewards short, casual, present-tense — and skips the corporate scaffolding. Telling Claude \"write this as a Slack message\" matters as much as telling it the content.",
      },
    ],
    exercise: {
      title: "Module 05 — Submission",
      instructions: {
        intro: "Use the anchor pattern on a real writing task.",
        steps: [
          "Pick one real email, Slack message, or short brief you owe this week",
          "Paste a sample of your own writing as the anchor",
          "Get Claude's draft. Edit the AI tells out in one follow-up prompt.",
          "Submit: the anchor sample, your prompt, and the final draft",
          "Add 1–2 sentences on what changed in your tone",
        ],
        deadlineNote: "Deadline: end of October 2026",
      },
    },
  };
}

// ============================================================
// MODULE 06 — Data & Analysis
// ============================================================

function module06(): ModuleSpec {
  const next = makeCounter();
  return {
    position: 6,
    number: "06",
    title: "Data & Analysis.",
    subtitle:
      "CSVs, tables, queries — and the one thing Claude is dangerous at.",
    heroSubtitle:
      "For MMI, RDB, and anyone with a spreadsheet — Claude can clean, restructure, and summarize tables. Just don't ask it to compute numbers that have to be exact.",
    level: ModuleLevel.ADVANCED,
    durationMinutes: 50,
    audienceLabel: "Analysts, researchers, anyone with spreadsheets",
    availableFrom: new Date("2026-06-18T00:00:00Z"),
    learningObjectives: [
      "Paste tabular data and get summaries, restructures, and anomaly checks",
      "Generate SQL or Sheets formulas by describing what you want",
      "Recognize when Claude is computing (unsafe) vs. describing (safe)",
      "Hand off to Excel, Sheets, or Python for actual math",
    ],
    sections: () => [
      {
        position: next(),
        number: "Section 01",
        title: "What you'll learn",
        type: SectionType.OBJECTIVES_BOX,
        content: {
          intro:
            "Tables are where Claude is most useful and most dangerous at the same time. This module teaches the safe lanes and the one rule that protects you from confidently wrong numbers.",
          label: "Learning Objectives",
          items: [
            "Paste-as-CSV for summaries and restructuring",
            "Describe-to-SQL: write English, get queries",
            "Know when Claude is allowed to do math (almost never)",
            "Hand off to the real tool when arithmetic must be exact",
          ],
        } satisfies ObjectivesBoxContent,
      },
      {
        position: next(),
        number: "Section 02",
        title: "Paste tables as CSV",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Claude reads tabular data best in CSV form (comma-separated values, one row per line). Most spreadsheets export to CSV in two clicks. From there Claude can ",
              s("describe"),
              " the data, restructure it, flag anomalies, or generate a written summary — without doing any calculation that needs to be exact.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "Paste-as-CSV pattern",
          intro: "Tell Claude what kind of read you want before pasting:",
          promptBlock: {
            body: "I'll paste a CSV of weekly media mentions by outlet. Tell me: (1) the top 3 outlets by total mentions, (2) any outlet whose mentions doubled or halved week-on-week, (3) a 2-sentence summary I can paste into a client recap. Don't calculate totals manually — just describe the patterns you see.\n\n[paste CSV]",
          },
        } satisfies ExampleCardContent,
      },
      {
        position: next(),
        number: "Section 03",
        title: "The math safety rule",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Claude is a language model, not a calculator. It can ",
              s("recognize patterns"),
              " in numbers (\"this outlet trended up\") but it should not be doing arithmetic you intend to publish — sums, averages, percentages, year-on-year. The numbers it returns are best-guess approximations of what arithmetic would look like.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.CALLOUT,
        content: {
          variant: "warn",
          title: "If the number has to be right, don't ask Claude.",
          body: "Use Claude to identify what calculation you need, and what formula or query would produce it — then run that calculation in Excel, Sheets, BigQuery, or Python. Claude describes; the real tool computes.",
        } satisfies CalloutContent,
      },
      {
        position: next(),
        number: "Section 04",
        title: "Describe-to-SQL (or to formula)",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Where Claude really shines for analysis: ",
              s("translating English into a query or formula you then run yourself"),
              ". You don't have to remember the SUMIFS syntax. Describe what you want; Claude writes the formula; you paste it into Sheets and trust the spreadsheet's math.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "Describe to SQL",
          intro: "Skip the SQL syntax wrestling:",
          promptBlock: {
            body: "I have a BigQuery table called media_mentions with columns: outlet (string), date (date), mentions (int), sentiment (-1/0/+1). Write me a SQL query that returns, for each outlet: total mentions in the last 30 days, average daily mentions, and the share of positive sentiment (% of rows where sentiment = +1). Order by total mentions descending.",
          },
        } satisfies ExampleCardContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "Describe to Sheets formula",
          intro: "Same idea, for a regular spreadsheet:",
          promptBlock: {
            body: "I have a Google Sheet where column A is dates, column B is outlet names, column C is mention counts. Write me a formula that sums column C for outlet \"Inquirer\" between Jan 1 and Jan 31. Use SUMIFS.",
          },
        } satisfies ExampleCardContent,
      },
      {
        position: next(),
        number: "Section 05",
        title: "Hand-off: when to leave Claude entirely",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Three quick signals you should leave Claude and switch to a real data tool:",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.COMPARISON,
        content: {
          goodLabel: "✓ Keep in Claude",
          goodText:
            "Pattern descriptions · Restructure rows/columns · Generate the formula or query · Write the narrative summary",
          badLabel: "✗ Hand off to Sheets / BigQuery / Python",
          badText:
            "Actual calculations · More than ~200 rows · Anything client-billable that depends on the number · Anything where exactness matters",
        } satisfies ComparisonContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.TRY_IT,
        content: {
          tag: "Practice",
          title: "Try it yourself — 20 minutes",
          intro:
            "Take a real dataset from your work this week and run the safe pattern:",
          steps: [
            "Export a CSV from a work spreadsheet (redact identifying info first)",
            "Use Claude to describe patterns and anomalies",
            "Ask Claude to write the formula or query for any calculation you need",
            "Run the actual calculation in Sheets/SQL — confirm it matches expectations",
            "Reflect: where did Claude save time, where did you hand off?",
          ],
        } satisfies TryItContent,
      },
    ],
    quizzes: () => [
      {
        position: 1,
        question:
          "Claude reads your CSV and tells you \"the average daily mentions are 234.7.\" You're putting this in a client report. What's the right call?",
        options: [
          "Use 234.7 — Claude read the data",
          "Use 235 (round up) so it looks cleaner",
          "Have Claude write the formula, then run AVG() in Sheets and use that number",
          "Recount manually",
        ],
        correctIndex: 2,
        feedback:
          "Claude is approximating. For published numbers, ask Claude for the formula or query and run it in the real tool. Claude's job is description, Sheets' job is arithmetic.",
      },
      {
        position: 2,
        question:
          "When is Claude the right tool to keep doing the actual work?",
        options: [
          "Calculating exact revenue totals from a transactions CSV",
          "Spotting which outlets had unusual week-over-week changes in a media data export",
          "Producing the final percentage on a client invoice",
          "Reconciling two financial reports",
        ],
        correctIndex: 1,
        feedback:
          "Pattern-spotting and qualitative description = good Claude use. Exact financial math = always hand off.",
      },
      {
        position: 3,
        question:
          "You're stuck on SQL syntax. What's the most useful Claude move?",
        options: [
          "Ask Claude to run the query for you against the database",
          "Describe in plain English what you want the query to return, including table and column names, and have Claude write the SQL — then run it yourself in BigQuery",
          "Ask Claude for the answer based on the data you describe",
          "Skip SQL and just use Excel",
        ],
        correctIndex: 1,
        feedback:
          "Describe-to-SQL is a power move. Claude writes the query, you run it where the real data lives. You get speed + correctness.",
      },
    ],
    exercise: {
      title: "Module 06 — Submission",
      instructions: {
        intro: "Run the safe pattern on a real dataset.",
        steps: [
          "Pick a small real dataset from your work (redact identifying info)",
          "Use Claude to describe patterns + write any needed formula or query",
          "Run the actual calculation in Sheets, BigQuery, or your tool of choice",
          "Submit: the description prompt, the formula/query Claude wrote, and what the real tool returned",
          "Add 1–2 sentences on where the hand-off happened",
        ],
        deadlineNote: "Deadline: end of November 2026",
      },
    },
  };
}

// ============================================================
// MODULE 07 — Building Your Workflow (capstone)
// ============================================================

function module07(): ModuleSpec {
  const next = makeCounter();
  return {
    position: 7,
    number: "07",
    title: "Building Your Workflow.",
    subtitle:
      "Claude as a daily habit — projects, chained tasks, and when to NOT use it.",
    heroSubtitle:
      "Mastery isn't more prompts. It's knowing which three things to use Claude for every day — and which to leave alone. End the program with the workflow you'll actually keep.",
    level: ModuleLevel.MASTERY,
    durationMinutes: 50,
    audienceLabel: "All employees — M2, MMI, RDB",
    availableFrom: new Date("2026-06-22T00:00:00Z"),
    learningObjectives: [
      "Identify your repeat tasks where Claude saves real time",
      "Use Projects to keep context across conversations",
      "Chain tasks instead of cramming them into one prompt",
      "Know when to skip Claude and just write it yourself",
    ],
    sections: () => [
      {
        position: next(),
        number: "Section 01",
        title: "What you'll learn",
        type: SectionType.OBJECTIVES_BOX,
        content: {
          intro:
            "Six months in, you've seen what Claude can do. This last module is about turning scattered use into a real habit — finding your three or four repeat tasks, setting up the rails for them, and being honest about when not to use Claude at all.",
          label: "Learning Objectives",
          items: [
            "Find your repeat tasks and stop reinventing the prompt",
            "Use Projects for persistent context",
            "Chain steps: outline → draft → critique → polish",
            "Recognize when Claude makes you slower",
          ],
        } satisfies ObjectivesBoxContent,
      },
      {
        position: next(),
        number: "Section 02",
        title: "Find your repeat tasks",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Most people get small wins from Claude scattered across the week. The big wins come from spotting your ",
              s("repeat tasks"),
              " — the same shape of writing, summarizing, or extraction you do dozens of times a month — and building one good prompt you keep using.",
            ),
            p(
              "Look at your last two weeks of work. What did you do more than twice? Those are your candidates.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.OBJECTIVES_BOX,
        content: {
          label: "Common Repeat Tasks (by role)",
          items: [
            "**Account managers** — weekly client status emails, post-meeting recap, brief drafting",
            "**PR associates** — press release drafts from key facts, pitch emails to journalists",
            "**Media analysts** — daily monitoring digest, sentiment summaries, anomaly notes",
            "**Data team** — CSV pattern reads, formula/query generation, dataset descriptions",
            "**Everyone** — turning Slack threads into clean meeting notes",
          ],
        } satisfies ObjectivesBoxContent,
      },
      {
        position: next(),
        number: "Section 03",
        title: "Projects: persistent context, no copy-paste",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "If you find yourself pasting the same background — the client name, your team's style guide, the brief — into every new conversation, set up a ",
              s("Project"),
              " in Claude. A Project holds reference material that's available in every conversation inside it. No more re-pasting.",
            ),
            p(
              "Good Project candidates: a single big client, a recurring report, a long-running campaign, your personal writing-anchor library.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "What goes in a Project",
          checklist: [
            "Style guide (or 2–3 anchor samples of your writing)",
            "The brief or campaign goals",
            "Glossary of terms specific to this client / project",
            "Recent meeting notes or status summaries",
            "Anything you'd otherwise paste at the start of every conversation",
          ],
        } satisfies ExampleCardContent,
      },
      {
        position: next(),
        number: "Section 04",
        title: "Chain steps instead of cramming",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Big tasks fall apart inside one giant prompt. Break them up. Four small turns beat one massive one — and let you steer at each step.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.COMPARISON,
        content: {
          badLabel: "✗ One mega-prompt",
          badText:
            "\"Research the topic, outline the article, write a 1500-word draft, critique it, and rewrite the weak sections.\" — produces an unfocused result that's hard to fix.",
          goodLabel: "✓ Four small turns",
          goodText:
            "(1) \"Suggest 3 angles\" → (2) \"Outline angle 2 in 7 bullets\" → (3) \"Draft each bullet into one paragraph\" → (4) \"What's the weakest paragraph and why? Rewrite it.\"",
        } satisfies ComparisonContent,
      },
      {
        position: next(),
        number: "Section 05",
        title: "When to NOT use Claude",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Mastery includes knowing when the tool slows you down. There are at least four cases where Claude is the wrong move.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.OBJECTIVES_BOX,
        content: {
          label: "Skip Claude when…",
          items: [
            "**The deliverable is shorter than the prompt** — a 1-sentence reply isn't worth a 3-sentence setup",
            "**Exactness matters and you'd have to verify everything anyway** — for legal, financial, or compliance writing, drafting yourself is faster than drafting + auditing",
            "**You're learning the skill on purpose** — if the point is to get better at writing, let yourself write",
            "**The conversation is emotional or sensitive** — a difficult message to a teammate should sound like you, not like a chatbot's idea of empathy",
          ],
        } satisfies ObjectivesBoxContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.CALLOUT,
        content: {
          variant: "success",
          title: "You finished the program.",
          body: "Six months of Claude at Work. The goal was never to use Claude for everything — it was to use it deliberately for the right things. Make one habit from this module and you'll get the compounding benefit for years.",
        } satisfies CalloutContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.TRY_IT,
        content: {
          tag: "Capstone",
          title: "Build your workflow — 30 minutes",
          intro: "Take everything from the program and design YOUR workflow:",
          steps: [
            "List the 3 repeat tasks Claude could help you with weekly",
            "For your #1 task, write the prompt you'd save and reuse",
            "Set up one Project in Claude with the reference material that task needs",
            "Run the workflow once on a real piece of work",
            "Note: how long did it take, vs. before this program?",
          ],
        } satisfies TryItContent,
      },
    ],
    quizzes: () => [
      {
        position: 1,
        question:
          "You're paste-bombing the same client style guide into every new Claude chat. What's the better move?",
        options: [
          "Save the style guide as a text file and re-paste it each time",
          "Set up a Project in Claude with the style guide attached — it's available in every conversation in that Project",
          "Memorize the style guide",
          "Ask Claude to remember it (Claude doesn't have permanent memory across chats)",
        ],
        correctIndex: 1,
        feedback:
          "Projects exist for exactly this. Persistent reference material across conversations — no more paste-bombing.",
      },
      {
        position: 2,
        question:
          "You have a 1500-word report to write. Which workflow gives the best result?",
        options: [
          "One prompt: \"write me a 1500-word report on X with intro, body, and conclusion\"",
          "Outline first (separate prompt), then have Claude draft each section in its own turn",
          "Write it all yourself and have Claude proofread at the end",
          "Use voice dictation instead",
        ],
        correctIndex: 1,
        feedback:
          "Chaining beats cramming. Outline → section drafts → critique gives you four steering points instead of one. Each turn is focused enough to actually be useful.",
      },
      {
        position: 3,
        question:
          "Which of these is the WORST use of Claude?",
        options: [
          "Drafting a weekly client status email from your bullet-point notes",
          "Cleaning up a Taglish Slack thread into formal English meeting minutes",
          "Composing a personal, sensitive message to a teammate going through a hard time",
          "Generating a SQL query from your plain-English description",
        ],
        correctIndex: 2,
        feedback:
          "Sensitive, personal communication should sound like you. Claude can help you find the right structure, but the words should come from your hand. It's a place to skip the AI and write yourself.",
      },
    ],
    exercise: {
      title: "Module 07 — Capstone Submission",
      instructions: {
        intro:
          "Your final submission for the Claude at Work program. Design and document the workflow you'll actually keep using.",
        steps: [
          "List your top 3 repeat work tasks where Claude saves time",
          "For your #1 task, paste the prompt template you'd save and reuse",
          "Describe one Project you'd set up — what reference material would go in it?",
          "Reflect (5–7 sentences): what changed in how you work over the last 6 months?",
          "Submit to your manager for the final review",
        ],
        deadlineNote: "Deadline: end of December 2026 — last submission of the program.",
      },
    },
  };
}

// ============================================================
// MODULE 08 — Claude Playbook (bonus reference, always available)
// ============================================================

function module08(): ModuleSpec {
  const next = makeCounter();
  return {
    position: 8,
    number: "08",
    title: "Claude Playbook.",
    subtitle:
      "Ten concrete recipes — with the exact prompts to copy.",
    heroSubtitle:
      "A working reference. Each section is one practical task you'll do this week, with the prompt to copy. Bookmark it.",
    level: ModuleLevel.FOUNDATION,
    durationMinutes: 25,
    audienceLabel: "All employees — M2, MMI, RDB",
    availableFrom: new Date("2026-06-01T00:00:00Z"),
    learningObjectives: [
      "Have a copy-ready prompt for the 10 most common Claude tasks",
      "Know which recipe fits which situation",
      "Adapt the templates to your own work in under 30 seconds",
    ],
    sections: () => [
      {
        position: next(),
        number: "Section 01",
        title: "How to use this playbook",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "This isn't a module to read through — it's a kitchen recipe card you come back to. Each section is one task. Skim until you find the one you need today, copy the prompt, and adapt the placeholders to your situation.",
            ),
            p(
              s("Every prompt below"),
              " is real and tested. Replace the bracketed parts (",
              s("[like this]"),
              ") with your own context.",
            ),
          ],
        } satisfies TextContent,
      },

      // ---- Recipe 1: Excel / CSV ----
      {
        position: next(),
        number: "Section 02",
        title: "Work with your Excel or CSV data",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Use this when you have a spreadsheet and want a summary, an anomaly check, or a formula written for you. Remember: Claude ",
              s("describes"),
              " the data and ",
              s("writes formulas"),
              ", but never run-the-actual-math. Paste the formula back into Sheets/Excel.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "Recipe — Describe a spreadsheet",
          intro:
            "Export your sheet as CSV (File → Download → CSV). Paste it after this prompt:",
          promptBlock: {
            body: "I'm pasting a CSV of [what the data is — e.g. weekly media mentions by outlet]. Tell me: (1) top 3 outlets by total, (2) any outlet whose number doubled or halved week-on-week, (3) a 2-sentence summary I can paste into a client recap. Don't calculate exact totals — describe the patterns you see.\n\n[paste your CSV here]",
          },
        } satisfies ExampleCardContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "Recipe — Get a Sheets formula",
          intro:
            "Skip the SUMIFS wrestling. Describe what you want, paste the formula into Sheets:",
          promptBlock: {
            body: "I have a Google Sheet where column A is dates, column B is [what column B is], column C is [what column C is]. Write me a formula that [what you want it to compute — e.g. \"sums column C for category 'Coverage' between Jan 1 and Jan 31\"]. Use SUMIFS or similar.",
          },
        } satisfies ExampleCardContent,
      },

      // ---- Recipe 2: Email thread → action items ----
      {
        position: next(),
        number: "Section 03",
        title: "Pull action items out of an email thread",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "You're CC'd on a 12-message thread. Instead of reading it all, get the action items in 10 seconds.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "Recipe — Email thread to action list",
          intro: "Redact client names first, then paste:",
          promptBlock: {
            body: "Read the email thread below. Give me: (1) a 2-sentence summary of where things stand, (2) a list of action items with owner names and due dates, (3) any open question that wasn't answered. Skip the back-and-forth detail.\n\n[paste the thread here — change client names to [CLIENT]]",
          },
        } satisfies ExampleCardContent,
      },

      // ---- Recipe 3: Meeting transcript ----
      {
        position: next(),
        number: "Section 04",
        title: "Turn a meeting transcript into clean notes",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Whether from Zoom, Google Meet, or a Filipino-English conversation you typed up roughly — Claude can structure it into something that goes in the client folder.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "Recipe — Transcript to structured notes",
          intro: "Works on raw transcripts, Slack threads, or your own rough notes:",
          promptBlock: {
            body: "Below is a meeting transcript. Restructure it into: (1) Attendees, (2) Topics discussed (one bullet each, neutral tone), (3) Decisions made, (4) Action items with owner + due date, (5) Open questions. Keep it factual. Skip pleasantries.\n\n[paste transcript]",
          },
        } satisfies ExampleCardContent,
      },

      // ---- Recipe 4: Draft an email in your voice ----
      {
        position: next(),
        number: "Section 05",
        title: "Draft an email that sounds like you",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "The trick: paste one real email you already wrote, then describe the new situation. Claude mimics the pattern — your opener, your length, your way of making requests.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "Recipe — Email in your voice",
          intro: "The anchor pattern from Module 05, ready to copy:",
          promptBlock: {
            body: "Here's an email I wrote last week:\n\n[paste your actual email — one paragraph is enough]\n\nUsing the same voice — same opener, same tone, same way I make requests — write me a new email for this situation: [describe the new situation in 2 sentences].",
          },
        } satisfies ExampleCardContent,
      },

      // ---- Recipe 5: Brainstorm angles ----
      {
        position: next(),
        number: "Section 06",
        title: "Brainstorm angles for a story or campaign",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "When you're staring at a blank doc and need to start somewhere. Claude is excellent at the opening half of brainstorming — generating options you can pick from.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "Recipe — Generate angles",
          promptBlock: {
            body: "I'm working on [a press release / a campaign / a pitch / a deck] about [topic]. The audience is [who]. The goal is [persuade / inform / entertain]. Give me 7 different angles I could take, each in 2 sentences. Then mark which one is the safest, which is the boldest, and which one would surprise the audience.",
          },
        } satisfies ExampleCardContent,
      },

      // ---- Recipe 6: Quick research ----
      {
        position: next(),
        number: "Section 07",
        title: "Quick research on a topic",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Treat Claude as a research scout — not the source. It maps the landscape; you verify with primary sources before publishing.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "Recipe — Research scout",
          promptBlock: {
            body: "I'm researching [topic] for [purpose — e.g. a client briefing]. Give me: (1) the 5 most important facts a non-expert should know, (2) what kind of source typically reports each fact (e.g. government agency, academic paper, industry body), (3) a 1-5 confidence rating per fact, (4) anything likely to have changed in the last 12 months. Don't invent URLs — describe the source type only.",
          },
        } satisfies ExampleCardContent,
      },

      // ---- Recipe 7: Translate / tone-shift ----
      {
        position: next(),
        number: "Section 08",
        title: "Translate or shift tone",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Useful for: forwarding an English brief to a Filipino-speaking field team, polishing a Taglish Slack thread into a formal client memo, or softening a sharp internal email before sending up.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "Recipe — Translate + tone-shift",
          promptBlock: {
            body: "Here's a message: [paste]\n\nRewrite it in [target language — Filipino / Taglish / English] with a [target tone — formal / casual / warm / direct] tone, suitable for [who will read it]. Keep the meaning identical. Don't add new information.",
          },
        } satisfies ExampleCardContent,
      },

      // ---- Recipe 8: Compare two documents ----
      {
        position: next(),
        number: "Section 09",
        title: "Compare two documents",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Two versions of a contract. Two drafts of a brief. Two competitor pitches. Claude can find the meaningful differences in 30 seconds.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "Recipe — Side-by-side comparison",
          promptBlock: {
            body: "Below are two versions of [what they are — e.g. a client contract]. List the substantive differences in a table with columns: (1) Topic, (2) Version A says, (3) Version B says, (4) Why this difference might matter. Ignore formatting / wording changes that don't change meaning.\n\n[VERSION A]\n[paste]\n\n[VERSION B]\n[paste]",
          },
        } satisfies ExampleCardContent,
      },

      // ---- Recipe 9: Presentation outline ----
      {
        position: next(),
        number: "Section 10",
        title: "Outline a presentation in 60 seconds",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Stop staring at the blank slide one. Claude gives you a working skeleton you can rearrange in 5 minutes.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "Recipe — Deck outline",
          promptBlock: {
            body: "Outline a [length, e.g. 10-slide] presentation on [topic] for [audience]. Each slide: one short title + 2-3 bullets of what to say. The goal is to [persuade / inform / sell / brief]. End with a [clear call-to-action / discussion question / next-step].",
          },
        } satisfies ExampleCardContent,
      },

      // ---- Recipe 10: Explain like I'm new here ----
      {
        position: next(),
        number: "Section 11",
        title: "Explain something complex in plain words",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "For onboarding briefings, client emails when the topic is technical, or just understanding something new yourself.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "Recipe — Plain-words explanation",
          promptBlock: {
            body: "Explain [topic] in plain language to [audience — e.g. a junior account manager / a client who isn't technical / yourself]. Three paragraphs max. Use one concrete real-world analogy. Avoid jargon. End with the one sentence I should remember.",
          },
        } satisfies ExampleCardContent,
      },

      // Closing
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.CALLOUT,
        content: {
          variant: "info",
          title: "Bookmark this module.",
          body: "Use the 🔖 Save button in the hero. It'll appear on your dashboard under \"Saved for later\" so you can grab a recipe in two clicks any time.",
        } satisfies CalloutContent,
      },
    ],
    quizzes: () => [
      {
        position: 1,
        question:
          "You have a CSV of weekly media mentions. You want the exact average mentions per outlet, and you'll publish that number in a client deck. What's the safe move?",
        options: [
          "Paste the CSV into Claude and use whatever average it returns",
          "Ask Claude to write the AVERAGEIF formula, then run that formula in Sheets to get the real number",
          "Round whatever Claude gives you to the nearest 10",
          "Ask Claude to count the rows manually",
        ],
        correctIndex: 1,
        feedback:
          "Claude writes the formula, the spreadsheet does the math. For numbers that'll be published, never let Claude do arithmetic directly.",
      },
      {
        position: 2,
        question:
          "Your team uses a mix of Filipino and English in Slack. You need to send a clean English summary to a US client. What's the best prompt shape?",
        options: [
          "\"translate this\"",
          "\"Paste it in English\"",
          "\"Rewrite this in English with a formal client-facing tone. Keep meaning identical. Don't add new information.\"",
          "\"make it sound nicer\"",
        ],
        correctIndex: 2,
        feedback:
          "Naming the target language, target tone, and explicit \"don't add information\" produces a translation you can send without editing 10 things.",
      },
      {
        position: 3,
        question:
          "You're brainstorming campaign angles. Claude gives you 7 options. You pick one and go. What did you skip that you shouldn't?",
        options: [
          "Asking Claude to write the campaign for you next",
          "Reading all 7 first and noting which are safe vs. bold vs. surprising",
          "Saving the prompt as a template",
          "Sharing with your manager",
        ],
        correctIndex: 1,
        feedback:
          "The point of brainstorming with Claude isn't the first idea — it's seeing the spread. Reading all 7 and tagging them by risk/reward is what separates a good pick from a default pick.",
      },
    ],
    exercise: {
      title: "Module 08 — Recipe in the wild",
      instructions: {
        intro:
          "Pick one recipe from this playbook and run it on a real piece of your work this week.",
        steps: [
          "Pick whichever recipe matches a task on your plate this week",
          "Adapt the placeholders to your actual context",
          "Run it with Claude (don't forget redaction)",
          "Submit: which recipe, what you replaced the placeholders with, and what came back. 3–5 sentences.",
        ],
        deadlineNote: "No fixed deadline — submit whenever you use the playbook for real.",
      },
    },
  };
}

// ============================================================
// Exported curriculum
// ============================================================

export const CLAUDE_AT_WORK_MODULES: ModuleSpec[] = [
  module01(),
  module02(),
  module03(),
  module04(),
  module05(),
  module06(),
  module07(),
];

export const CLAUDE_AT_WORK_PROGRAM: ProgramSpec = {
  slug: "claude-at-work",
  title: "Claude 101",
  subtitle:
    "Four-week pilot for Finance and HR — from your first conversation to a workflow you'll keep.",
  description:
    "Seven foundation modules compressed into June 2026 for the Finance + HR pilot cohort. Two modules land each week; complete them at your own pace.",
  startDate: new Date("2026-06-01T00:00:00Z"),
  endDate: new Date("2026-06-30T23:59:59Z"),
  audienceRules: {
    departments: ["Finance", "HR", "HR / L&D"],
    roles: ["EMPLOYEE", "ADMIN"],
  },
  modules: CLAUDE_AT_WORK_MODULES,
};
