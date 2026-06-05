/**
 * Claude Playbook — a separate program where each module is a self-contained
 * "way to use Claude" with prompts you can copy, tips, and one exercise per topic.
 *
 * Open access: all 10 modules unlock at the program start date. Learners can pick
 * any module in any order.
 */

import { ModuleLevel, SectionType } from "@prisma/client";
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
  p,
  s,
  makeCounter,
  type ModuleSpec,
  type ProgramSpec,
} from "./curriculum";

const OPEN_FROM = new Date("2026-06-01T00:00:00Z");
const AUDIENCE = "Pilot · Finance + HR";

// ============================================================
// MODULE 01 — Excel & CSV Data
// ============================================================
function pb01(): ModuleSpec {
  const next = makeCounter();
  return {
    position: 1,
    number: "01",
    title: "Excel & CSV Data.",
    subtitle:
      "Describe spreadsheets, write formulas, find anomalies — without letting Claude do unsafe math.",
    heroSubtitle:
      "Got a CSV or a tab in Excel? Claude can read it, summarize it, restructure it, and write you the formula — just don't ask it to be the calculator.",
    level: ModuleLevel.FOUNDATION,
    durationMinutes: 20,
    audienceLabel: AUDIENCE,
    availableFrom: OPEN_FROM,
    learningObjectives: [
      "Paste CSV data and get a useful summary on the first try",
      "Have Claude generate Sheets formulas or SQL queries",
      "Spot anomalies and weekly changes without doing the math yourself",
      "Know exactly when to leave Claude and switch to the spreadsheet",
    ],
    sections: () => [
      {
        position: next(),
        number: "When to use this",
        title: "Spreadsheets without the spreadsheet pain",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Anytime you'd otherwise stare at a CSV and wonder where to start. Claude is excellent at ",
              s("reading"),
              " tabular data — describing patterns, surfacing outliers, suggesting next questions. Where it's weak is ",
              s("doing arithmetic"),
              " — for any number you'll publish, ask for the formula instead and run it yourself.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: "Set it up",
        title: "30 seconds of prep",
        type: SectionType.OBJECTIVES_BOX,
        content: {
          label: "Before you paste",
          items: [
            "**Export to CSV** — File → Download → CSV in Sheets, or Save As → CSV in Excel",
            "**Redact** — replace client names with [CLIENT], salaries with [REDACTED], any personal IDs with [PERSON_n]",
            "**Trim** — paste only the rows you need (Claude handles ~200 rows comfortably)",
            "**Keep your headers** — Claude needs the column names to talk about the data",
          ],
        } satisfies ObjectivesBoxContent,
      },
      {
        position: next(),
        number: "The prompt",
        title: "Describe-the-data, the right way",
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "Pattern read",
          intro: "Tell Claude what kind of read you want, then paste:",
          promptBlock: {
            body: "Below is a CSV of weekly media mentions by outlet. Tell me:\n  (1) the top 3 outlets by total mentions,\n  (2) any outlet whose mentions doubled or halved week-over-week,\n  (3) a 2-sentence summary I can paste into a client recap.\n\nDon't recalculate totals — just describe the patterns you see. Round only when describing.\n\n[paste CSV here]",
          },
        } satisfies ExampleCardContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "Write me the formula",
          intro: "When you need an exact number, get Claude to write it:",
          promptBlock: {
            body: "I have a Google Sheet:\n  - Column A: date\n  - Column B: outlet\n  - Column C: mention count\n\nWrite a SUMIFS formula that sums column C for outlet \"Inquirer\" between Jan 1 and Jan 31. Show me the cell I'd paste it into.",
          },
        } satisfies ExampleCardContent,
      },
      {
        position: next(),
        number: "Safety",
        title: "The math rule",
        type: SectionType.CALLOUT,
        content: {
          variant: "warn",
          title: "If the number has to be right, don't ask Claude.",
          body: "Use Claude to identify what calculation you need, then run that calculation in Sheets, Excel, BigQuery, or Python. Claude describes; the real tool computes.",
        } satisfies CalloutContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.TRY_IT,
        content: {
          tag: "Try it",
          title: "Run the pattern on something real — 15 minutes",
          intro: "Pick a real CSV from this week:",
          steps: [
            "Export to CSV, redact identifying info",
            "Paste with the pattern-read prompt above",
            "Read its 3-bullet answer; ask one follow-up to sharpen",
            "Ask for the formula for ONE number you actually need",
            "Run that formula in Sheets — does it match expectations?",
          ],
        } satisfies TryItContent,
      },
    ],
    quizzes: () => [
      {
        position: 1,
        question: "Claude reads your CSV and tells you the average is 234.7. You're putting this in a client recap. What's right?",
        options: [
          "Use 234.7 — Claude read the data",
          "Round to 235 so it looks cleaner",
          "Get Claude to write the AVG() formula and run it in Sheets, then use that number",
          "Recount manually",
        ],
        correctIndex: 2,
        feedback: "Claude is approximating. For published numbers, get the formula from Claude and let Sheets do the math.",
      },
      {
        position: 2,
        question: "What's the WORST CSV to paste into Claude without redacting?",
        options: [
          "Public weekly traffic data with no names",
          "A salary export with employee names and TINs",
          "Aggregated category counts from a public survey",
          "Anonymized A/B test rollups",
        ],
        correctIndex: 1,
        feedback: "Personal data (names, TINs, SSS, salaries) should never go into Claude unredacted. Replace with placeholders first.",
      },
    ],
    exercise: {
      title: "Excel/CSV — Submission",
      instructions: {
        intro: "Run the safe pattern on a real dataset.",
        steps: [
          "Pick a real CSV from your work (redact first)",
          "Use the pattern-read prompt to get a summary",
          "Get Claude to write a formula or query for one calculation",
          "Run the formula in Sheets/BigQuery; confirm the number",
          "Submit: the prompt you used + your reflection on where Claude saved time",
        ],
      },
    },
  };
}

// ============================================================
// MODULE 02 — Email Threads → Action Items
// ============================================================
function pb02(): ModuleSpec {
  const next = makeCounter();
  return {
    position: 2,
    number: "02",
    title: "Email Threads → Action Items.",
    subtitle:
      "Turn a 30-message reply-all into a clean list of who owes what, by when.",
    heroSubtitle:
      "Reply-alls are how decisions hide. Claude pulls out the owners, the deliverables, and the dates — no more re-reading the whole thread to find what you missed.",
    level: ModuleLevel.FOUNDATION,
    durationMinutes: 15,
    audienceLabel: AUDIENCE,
    availableFrom: OPEN_FROM,
    learningObjectives: [
      "Extract action items, owners, and due dates from messy threads",
      "Spot decisions that were made (and ones that quietly weren't)",
      "Catch action items Claude invents that aren't actually there",
      "Paste the result straight into your tracker",
    ],
    sections: () => [
      {
        position: next(),
        number: "When to use this",
        title: "30 messages, 5 minutes",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "You walked into a reply-all in progress. Or you missed three days. Or the thread branched and now nobody knows what was decided. Pasting the whole thing into Claude with the right prompt gets you a clean action-item table in under a minute.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: "Set it up",
        title: "Redact the obvious",
        type: SectionType.OBJECTIVES_BOX,
        content: {
          label: "Before you paste a thread",
          items: [
            "**Replace client names** — [CLIENT] / [BRAND]",
            "**Strip salaries, budgets, fees** if they don't belong in this analysis",
            "**Keep the senders** — Claude needs them to attribute action items correctly (or replace with [Person A] / [Person B] consistently)",
            "**Keep the dates** — Claude uses them to compute deadlines",
          ],
        } satisfies ObjectivesBoxContent,
      },
      {
        position: next(),
        number: "The prompt",
        title: "Action-item extraction",
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "Copy this prompt",
          intro: "Tell Claude the exact shape of the output you want:",
          promptBlock: {
            body: "Read the email thread below and extract a table:\n\n  | Action | Owner | Due date | Source message |\n\nRules:\n  - One row per action that someone agreed to do\n  - If the owner isn't clearly assigned, mark Owner = \"TBD\"\n  - If no due date is stated, mark Due date = \"none stated\" — don't guess\n  - In Source message, note who said it and roughly when (e.g. \"Maria, Tue 3pm\")\n  - Skip nice-to-haves and idle chatter — only commitments\n\n[paste thread here]",
          },
        } satisfies ExampleCardContent,
      },
      {
        position: next(),
        number: "Gotchas",
        title: "Things Claude makes up",
        type: SectionType.OBJECTIVES_BOX,
        content: {
          label: "Check before trusting",
          items: [
            "**Invented owners** — if nobody actually volunteered, Claude sometimes assigns the most senior person. Verify.",
            "**Soft commitments treated as commitments** — \"I might be able to\" is not \"I will\"",
            "**Date math** — if someone said \"next Friday,\" make sure Claude got the right Friday",
            "**Branched threads** — Claude can flatten branches and miss that a later message overrode an earlier one",
          ],
        } satisfies ObjectivesBoxContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.TRY_IT,
        content: {
          tag: "Try it",
          title: "Process a real thread — 10 minutes",
          intro: "Find a recent client or internal thread you owe a response on:",
          steps: [
            "Copy the whole thread, top to bottom",
            "Redact client/personal details",
            "Paste with the prompt above",
            "Read the table — note any item that feels wrong",
            "Verify the 2 most important rows against the actual messages",
          ],
        } satisfies TryItContent,
      },
    ],
    quizzes: () => [
      {
        position: 1,
        question: "Claude's extracted table lists \"Maria — finalize budget — next Friday\" but you scan the thread and Maria only said \"I'll think about it.\" What do you do?",
        options: [
          "Use it anyway — Claude usually gets it right",
          "Edit the row to \"TBD\" or remove it; soft commitments aren't actions",
          "Trust Claude and email Maria the budget deadline",
          "Ignore the whole table",
        ],
        correctIndex: 1,
        feedback: "Claude can promote soft commitments. Always verify the 2-3 most important rows against the source.",
      },
      {
        position: 2,
        question: "Best column structure to ask Claude for?",
        options: [
          '"Give me the action items"',
          '"Make a list of stuff to do"',
          'A table with explicit columns: Action / Owner / Due date / Source message, with rules for blank values',
          'A paragraph summary',
        ],
        correctIndex: 2,
        feedback: "Telling Claude the exact columns AND the rules for blanks gets you a clean grid you can paste straight into Sheets or Notion.",
      },
    ],
    exercise: {
      title: "Action items — Submission",
      instructions: {
        steps: [
          "Pick a real thread (>5 replies) from your inbox",
          "Redact and paste with the action-item prompt",
          "Verify the top 3 rows against the actual messages",
          "Submit: the table Claude produced + what you corrected (if anything)",
        ],
      },
    },
  };
}

// ============================================================
// MODULE 03 — Meeting Transcripts → Clean Notes
// ============================================================
function pb03(): ModuleSpec {
  const next = makeCounter();
  return {
    position: 3,
    number: "03",
    title: "Meeting Notes from Transcripts.",
    subtitle:
      "Turn Zoom/Teams transcripts into clean notes — decisions, action items, open questions.",
    heroSubtitle:
      "Modern meetings have transcripts. Most are unreadable. The right prompt turns a 4,000-word transcript into a 200-word recap you can send.",
    level: ModuleLevel.FOUNDATION,
    durationMinutes: 15,
    audienceLabel: AUDIENCE,
    availableFrom: OPEN_FROM,
    learningObjectives: [
      "Convert a raw meeting transcript into structured notes",
      "Separate decisions, action items, and open questions",
      "Catch what Claude misattributes or oversummarizes",
      "Produce notes good enough to forward without editing",
    ],
    sections: () => [
      {
        position: next(),
        number: "When to use this",
        title: "Transcripts → recap, in 60 seconds",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Zoom and Teams now generate transcripts by default. They're long, raw, and full of \"um\"s and crosstalk. Paste with the right prompt and you get notes that pass the \"would I forward this?\" test.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: "Set it up",
        title: "Three quick edits before pasting",
        type: SectionType.OBJECTIVES_BOX,
        content: {
          label: "Cleanup pass",
          items: [
            "**Trim** — remove the first/last 2 minutes (small talk and goodbyes)",
            "**Redact** — client names, dollar figures, anything confidential",
            "**Keep speaker labels** — Claude needs them to attribute decisions correctly",
          ],
        } satisfies ObjectivesBoxContent,
      },
      {
        position: next(),
        number: "The prompt",
        title: "Three-bucket structure",
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "Copy this prompt",
          intro: "Asking for three buckets keeps the recap actually useful:",
          promptBlock: {
            body: "Read the meeting transcript below and give me a recap in three sections:\n\n  ## Decisions made\n  - Bullet list of things the group agreed on. If a decision was deferred, say \"deferred to [next time]\" — don't pretend it was decided.\n\n  ## Action items\n  | Action | Owner | Due |\n\n  ## Open questions\n  - Things raised but not resolved\n\nKeep it under 250 words total. Quote sparingly — only when the exact wording matters.\n\n[paste transcript here]",
          },
        } satisfies ExampleCardContent,
      },
      {
        position: next(),
        number: "Gotchas",
        title: "What transcripts get wrong",
        type: SectionType.OBJECTIVES_BOX,
        content: {
          label: "Sanity-check these",
          items: [
            "**Misattributed quotes** — auto-transcripts swap speakers especially during crosstalk",
            "**Decisions that weren't** — Claude sometimes promotes \"we should\" to \"we will\"",
            "**Numbers** — mistranscribed dollars/dates; verify before using",
            "**Missing context** — short references like \"the deck\" or \"that vendor\" — flag if it's not clear who/what",
          ],
        } satisfies ObjectivesBoxContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.TRY_IT,
        content: {
          tag: "Try it",
          title: "Recap your most recent call — 10 minutes",
          intro: "Grab the transcript of a meeting from this week:",
          steps: [
            "Trim opening/closing small talk",
            "Redact client/budget details",
            "Paste with the 3-bucket prompt above",
            "Scan the decisions and verify the 2 most important against the transcript",
            "Compare to what you'd have written from memory",
          ],
        } satisfies TryItContent,
      },
    ],
    quizzes: () => [
      {
        position: 1,
        question: "Why ask Claude for three explicit buckets (Decisions / Actions / Open questions) instead of just \"summarize\"?",
        options: [
          "Looks more professional",
          "Forces Claude to separate \"what was decided\" from \"what was discussed\" — the most common confusion in recaps",
          "Saves tokens",
          "It's the only way Claude can summarize",
        ],
        correctIndex: 1,
        feedback: "The structure forces the distinction that recipients actually care about: what's now done vs. what's still open.",
      },
      {
        position: 2,
        question: "Your auto-transcript says \"Mark: we'll send the deck Friday.\" The actual recording has Mark saying \"Maria, can you send the deck Friday?\" What likely happened?",
        options: [
          "Mark stole the action item",
          "Auto-transcripts often misattribute during crosstalk — verify owners before assigning",
          "It's fine, same outcome",
          "Claude rewrote it",
        ],
        correctIndex: 1,
        feedback: "Auto-transcripts swap speakers regularly. Always verify owners of important action items.",
      },
    ],
    exercise: {
      title: "Meeting notes — Submission",
      instructions: {
        steps: [
          "Pick a recent meeting transcript (Zoom, Teams, Otter, etc.)",
          "Redact and paste with the 3-bucket prompt",
          "Verify the top 2 decisions and top 2 action items",
          "Submit the cleaned recap + 1 sentence on what you corrected",
        ],
      },
    },
  };
}

// ============================================================
// MODULE 04 — Emails in Your Voice
// ============================================================
function pb04(): ModuleSpec {
  const next = makeCounter();
  return {
    position: 4,
    number: "04",
    title: "Emails in Your Voice.",
    subtitle:
      "Paste one email you wrote. Get the next one in the same voice.",
    heroSubtitle:
      "Most \"AI emails\" sound like AI. The fix is one paste away: give Claude a sample of how you actually write, then ask for more.",
    level: ModuleLevel.FOUNDATION,
    durationMinutes: 15,
    audienceLabel: AUDIENCE,
    availableFrom: OPEN_FROM,
    learningObjectives: [
      "Anchor Claude to your real voice with a single example",
      "Choose between drafting fresh and polishing your own rough cut",
      "Strip the AI tells (em-dashes, hedging, closing summaries) in one follow-up",
      "Match the channel — email vs. Slack vs. press release",
    ],
    sections: () => [
      {
        position: next(),
        number: "When to use this",
        title: "Recurring emails are the biggest win",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Client status updates, post-meeting recaps, polite no's, follow-ups. Anything you write more than twice a month is a candidate. The first draft should take 20 seconds, not 20 minutes.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: "The prompt",
        title: "Anchor with one real example",
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "The anchor pattern",
          intro: "Paste an email YOU actually wrote, then ask for more in that voice:",
          promptBlock: {
            body: "Here's an email I wrote last week:\n\n  ---\n  [paste your actual email — 1 paragraph is fine]\n  ---\n\nUsing the same voice — same opener, same level of formality, same way I make requests, same close — write a new email for this situation:\n\n  [describe new situation in 2 sentences]",
          },
        } satisfies ExampleCardContent,
      },
      {
        position: next(),
        number: "Pick your workflow",
        title: "Draft fresh vs. polish yours",
        type: SectionType.COMPARISON,
        content: {
          goodLabel: "✓ Draft fresh when…",
          goodText:
            "You don't know how to open, or it's a kind of email you don't normally write (sympathy, formal apology, board update)",
          badLabel: "✓ Polish yours when…",
          badText:
            "You already know what to say but your first draft is too long, too sharp, or just rough — Claude tightens it without changing the meaning",
        } satisfies ComparisonContent,
      },
      {
        position: next(),
        number: "Remove the AI tells",
        title: "Strip the giveaways in one prompt",
        type: SectionType.OBJECTIVES_BOX,
        content: {
          intro:
            "If a draft sounds like AI, don't rewrite by hand — ask Claude to remove the tells. Reply in the same chat:",
          label: "\"Rewrite without:\"",
          items: [
            "**em-dashes** (more than one per paragraph)",
            "**hedging openers** (\"It's worth noting…\" / \"It's important to remember…\")",
            "**generic flattery** (\"Great question!\" / \"Excellent point.\")",
            "**closing summaries** that repeat what you just said",
            "**list-when-prose-was-asked-for** — keep it as paragraphs",
          ],
        } satisfies ObjectivesBoxContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.COMPARISON,
        content: {
          mono: true,
          badLabel: "✗ Same content, wrong channel",
          badText: "\"We are pleased to announce that, after careful consideration, our team has reached the decision to extend the project timeline by one week.\" — pasted into Slack",
          goodLabel: "✓ Slack-native",
          goodText: "\"Heads up — pushing the timeline by a week. New dates landing in your inbox shortly.\"",
        } satisfies ComparisonContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.TRY_IT,
        content: {
          tag: "Try it",
          title: "Anchor + draft one real email — 10 minutes",
          intro: "Pick one email you owe this week:",
          steps: [
            "Find one of YOUR own emails — any topic — as your anchor sample",
            "Paste it with the anchor prompt and describe the new situation",
            "Read the draft. Scan for em-dashes, hedging, closing summary.",
            "Ask Claude to rewrite without the AI tells",
            "Send it (or save as draft)",
          ],
        } satisfies TryItContent,
      },
    ],
    quizzes: () => [
      {
        position: 1,
        question: "Claude's draft starts with \"It's worth noting that…\" and ends with \"In summary, the deadline is Friday.\" Fastest fix?",
        options: [
          "Rewrite the opening and closing by hand",
          "Reply: \"Rewrite without hedging openers or closing summaries — keep it to 3 sentences\"",
          "Send it as-is",
          "Start over with a stricter prompt",
        ],
        correctIndex: 1,
        feedback: "Name the tells you want gone. Claude removes them in one round. Faster than retyping.",
      },
      {
        position: 2,
        question: "When does \"polish yours\" beat \"draft fresh\"?",
        options: [
          "Always",
          "When you already know what to say but the wording is too sharp or too long",
          "Only for short emails",
          "Never — drafting fresh is always faster",
        ],
        correctIndex: 1,
        feedback: "Polish-yours preserves your meaning while letting Claude smooth edges. Draft-fresh is for when you don't have content yet.",
      },
    ],
    exercise: {
      title: "Voice anchor — Submission",
      instructions: {
        steps: [
          "Pick a real email or Slack message you owe this week",
          "Use the anchor pattern with a sample of your own writing",
          "After Claude's draft, ask it to strip the AI tells in one prompt",
          "Submit: the anchor sample + the final draft",
          "Add 1–2 sentences on what you'd usually have spent time on instead",
        ],
      },
    },
  };
}

// ============================================================
// MODULE 05 — Brainstorming Angles
// ============================================================
function pb05(): ModuleSpec {
  const next = makeCounter();
  return {
    position: 5,
    number: "05",
    title: "Brainstorming Angles.",
    subtitle: "Open a creative session with 8 angles instead of a blank page.",
    heroSubtitle:
      "Best use of Claude in creative work: never the answer, always the warm-up. Five minutes with Claude generates the angles you'd otherwise stare at the wall for.",
    level: ModuleLevel.FOUNDATION,
    durationMinutes: 15,
    audienceLabel: AUDIENCE,
    availableFrom: OPEN_FROM,
    learningObjectives: [
      "Generate 5–10 angles for any creative problem",
      "Force Claude past its first three obvious takes",
      "Pick the angle that's yours and discard the rest",
      "Avoid the \"first idea is the right idea\" trap",
    ],
    sections: () => [
      {
        position: next(),
        number: "When to use this",
        title: "The blank page is the enemy",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Pitching a press release angle. Naming a campaign. Coming up with three ways to frame the same client win. Claude shines here — ",
              s("not"),
              " because its ideas are great (they're usually fine), but because seeing 8 mediocre ideas helps you find your 1 good one.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: "The prompt",
        title: "Five-angle opener",
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "Copy this prompt",
          intro: "Force Claude to vary — same situation, different angles:",
          promptBlock: {
            body: "I'm working on [the task — e.g. \"a press release for a Filipino tech client launching their first international product\"].\n\nGive me 5 distinct angles I could lead with. Each angle should be:\n  - One sentence stating the angle\n  - One sentence on why it could work\n  - One sentence on who it'd resonate with most\n\nMake them genuinely different — not five versions of the same idea. Don't tell me which is best.",
          },
        } satisfies ExampleCardContent,
      },
      {
        position: next(),
        number: "Push past obvious",
        title: "The \"three more\" trick",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Claude's first batch is usually the three most obvious takes plus two safe variations. After it answers, ask: ",
              s("\"Give me 3 more — but weirder. Things I wouldn't have thought of.\""),
              " That's where the interesting ones show up.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: "Tips",
        title: "What makes the output useful",
        type: SectionType.OBJECTIVES_BOX,
        content: {
          label: "Brainstorm rules",
          items: [
            "**Pick 1, discard the rest** — quantity is the point, not consensus",
            "**Don't ask Claude to pick** — it'll pick the safest. You pick.",
            "**Add context Claude couldn't know** — the client's vibe, your team's history, what got rejected last time",
            "**Stop when you find the one** — don't keep generating",
          ],
        } satisfies ObjectivesBoxContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.TRY_IT,
        content: {
          tag: "Try it",
          title: "Brainstorm a real thing — 10 minutes",
          intro: "Find a real creative problem you have right now:",
          steps: [
            "Frame your situation in 1–2 sentences",
            "Use the five-angle prompt above",
            "Read all 5. Are any actually interesting?",
            "If not, ask for 3 more — \"weirder\"",
            "Pick 1 angle. Discard the others. Move on.",
          ],
        } satisfies TryItContent,
      },
    ],
    quizzes: () => [
      {
        position: 1,
        question: "Claude gave you 5 angles. They all feel similar. Best next move?",
        options: [
          "Pick the least bad one and move on",
          "Reply: \"Give me 3 more — but weirder. Things I wouldn't have thought of\"",
          "Start a new chat with a longer prompt",
          "Ask Claude to score them 1–10",
        ],
        correctIndex: 1,
        feedback: "Claude's first batch tends safe. \"Weirder\" pushes it into territory that's actually useful for creative work.",
      },
      {
        position: 2,
        question: "Should you ask Claude which angle is best?",
        options: [
          "Yes — Claude has good judgment",
          "No — Claude picks the safest, and the safest is rarely the best in creative work",
          "Only if you're not sure",
          "Only if you give it more context first",
        ],
        correctIndex: 1,
        feedback: "Picking is your job. Claude generates options; you bring the judgment.",
      },
    ],
    exercise: {
      title: "Brainstorm — Submission",
      instructions: {
        steps: [
          "Pick a real creative problem from your plate",
          "Generate 5 angles, then push for 3 more weirder",
          "Pick 1 — the one that felt fresh AND fits the situation",
          "Submit: your problem, the 8 angles, and the 1 you picked + why",
        ],
      },
    },
  };
}

// ============================================================
// MODULE 06 — Quick Research with Verification
// ============================================================
function pb06(): ModuleSpec {
  const next = makeCounter();
  return {
    position: 6,
    number: "06",
    title: "Quick Research, Verified.",
    subtitle: "Scope a research question fast, then verify what matters.",
    heroSubtitle:
      "Claude is the world's fastest research scout and a confident bullshitter. Both at once. The trick is using the speed without trusting the conclusions.",
    level: ModuleLevel.FOUNDATION,
    durationMinutes: 20,
    audienceLabel: AUDIENCE,
    availableFrom: OPEN_FROM,
    learningObjectives: [
      "Scope a research path in 60 seconds",
      "Ask for sources in a way Claude can answer honestly",
      "Spot the 4 hallucination tells",
      "Verify every fact before client-facing publication",
    ],
    sections: () => [
      {
        position: next(),
        number: "When to use this",
        title: "Scout, don't source",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Claude is the perfect ",
              s("opening half"),
              " of research — telling you what to look for, what kinds of sources cover this, what the major debates are. It's a much weaker ",
              s("closing half"),
              " — confirming specific facts. The fastest move is to use it for both halves, knowing that.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: "The prompt",
        title: "Scope-then-source",
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "Research scoping prompt",
          intro: "Ask Claude to map the territory, not give the answer:",
          promptBlock: {
            body: "I'm researching [your question — e.g. \"Philippine FMCG ad spend by category, 2024–2025\"].\n\nFor each angle below, give me:\n  (1) what sources typically cover this (government agency, industry body, academic, trade publication),\n  (2) the names of 2–3 specific publications/reports that usually have this kind of data,\n  (3) on a 1–5 scale, how confident you are that this is still accurate today,\n  (4) what would have changed in the last 12 months.\n\nDon't invent URLs. Don't make up exact statistics. Tell me the landscape — I'll find the numbers.",
          },
        } satisfies ExampleCardContent,
      },
      {
        position: next(),
        number: "Spot the tells",
        title: "Hallucination warning signs",
        type: SectionType.OBJECTIVES_BOX,
        content: {
          label: "When to be extra skeptical",
          items: [
            "**Suspicious specificity** — \"63.7%\" with no source you can find",
            "**Recent events confidently described** — Claude's training has a cutoff; anything \"in 2026\" is yellow",
            "**Quotes attributed to real people** — usually paraphrased, often invented",
            "**Too-clean statistics** — 60% / 70% / 80% that don't compound naturally",
          ],
        } satisfies ObjectivesBoxContent,
      },
      {
        position: next(),
        number: "Verify",
        title: "Before anything goes client-facing",
        type: SectionType.OBJECTIVES_BOX,
        content: {
          label: "The verification checklist",
          items: [
            "**Every statistic** — find the same number in a primary source",
            "**Every quote** — find the original, in context",
            "**Every name, company, role** — confirm spelling, position, timing",
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
          body: "\"Industry estimates suggest…\" with no source is worse than no statistic at all. Reputation is much harder to rebuild than research is to redo.",
        } satisfies CalloutContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.TRY_IT,
        content: {
          tag: "Try it",
          title: "Scope a real question — 15 minutes",
          intro: "Pick something you'd actually research this week:",
          steps: [
            "Frame your research question",
            "Use the scope-then-source prompt above",
            "Pick the 3 most useful sources Claude pointed at",
            "Open one of them and verify a claim Claude made",
            "Note: did the claim hold up?",
          ],
        } satisfies TryItContent,
      },
    ],
    quizzes: () => [
      {
        position: 1,
        question: "Claude gives you \"63.7% of Philippine consumers prefer mobile-first brands.\" You need this for a client deck. Right move?",
        options: [
          "Use it — the precision suggests it's real",
          "Round to 64% — looks cleaner",
          "Treat it as a hypothesis; find the same statistic in a primary source before using",
          "Use it but credit \"Claude AI\"",
        ],
        correctIndex: 2,
        feedback: "Suspicious specificity = hallucination tell. Verify against a primary source or don't use the number.",
      },
      {
        position: 2,
        question: "Best way to ask Claude for sources?",
        options: [
          "\"Cite your sources with URLs\"",
          "\"What kind of source would this typically come from, and how confident are you on a 1–5 scale?\"",
          "\"Are you sure?\"",
          "\"Give me 10 sources\"",
        ],
        correctIndex: 1,
        feedback: "Asking for URLs invites Claude to invent them. Asking for source TYPE and CONFIDENCE gets you a useful research map.",
      },
    ],
    exercise: {
      title: "Research scoping — Submission",
      instructions: {
        steps: [
          "Pick a research question relevant to your work",
          "Scope it with Claude — get source types + confidence ratings",
          "Pick 2 of Claude's claims to verify against primary sources",
          "Submit: the question, Claude's scope, and what verified vs. didn't",
        ],
      },
    },
  };
}

// ============================================================
// MODULE 07 — Translate & Tone-Shift
// ============================================================
function pb07(): ModuleSpec {
  const next = makeCounter();
  return {
    position: 7,
    number: "07",
    title: "Translate & Tone-Shift.",
    subtitle: "EN, Filipino, Taglish — and switching register without sounding stiff.",
    heroSubtitle:
      "Claude handles English, Filipino, and Taglish smoothly. Better than that: it can shift TONE in the same language — sharp to warm, formal to casual.",
    level: ModuleLevel.FOUNDATION,
    durationMinutes: 15,
    audienceLabel: AUDIENCE,
    availableFrom: OPEN_FROM,
    learningObjectives: [
      "Translate between English, Filipino, and Taglish",
      "Shift register without losing the meaning",
      "Soften sharp internal language before it goes external",
      "Match the formality the recipient actually expects",
    ],
    sections: () => [
      {
        position: next(),
        number: "When to use this",
        title: "Three useful cases",
        type: SectionType.OBJECTIVES_BOX,
        content: {
          label: "Common uses",
          items: [
            "**English brief → Filipino field team** — keep the structure, switch language",
            "**Taglish Slack thread → English meeting minutes** — formalize without flattening",
            "**Sharp internal email → polite client email** — same message, gentler delivery",
            "**Technical → plain language** — for stakeholders who don't have the jargon",
          ],
        } satisfies ObjectivesBoxContent,
      },
      {
        position: next(),
        number: "The prompt",
        title: "Soften without flattening",
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "Sharp → polite, same meaning",
          intro: "Sometimes the meaning is right, the delivery isn't:",
          promptBlock: {
            body: "Rewrite this for a client. Keep all the actual points and the deadline, but make it warmer and less directive. Give the client a way out if our timeline doesn't work. Cap at 4 sentences.\n\n  ---\n  [paste your sharp version]\n  ---",
          },
        } satisfies ExampleCardContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.COMPARISON,
        content: {
          badLabel: "✗ Internal version",
          badText: "\"The vendor missed the deadline. We need a new quote by Friday or we're moving on.\"",
          goodLabel: "✓ Same message, softened",
          goodText: "\"Following up on the timeline — we'd like to lock in a final quote by Friday so we can plan accordingly. If that's not workable, please let us know so we can adjust on our end.\"",
        } satisfies ComparisonContent,
      },
      {
        position: next(),
        number: "Filipino & Taglish",
        title: "What Claude is good at, what to double-check",
        type: SectionType.OBJECTIVES_BOX,
        content: {
          label: "Quality notes",
          items: [
            "**Filipino** — Claude handles formal Filipino well; ask for \"natural conversational Filipino\" to avoid stiffness",
            "**Taglish** — Claude knows code-switching patterns; specify register (\"casual office Taglish\" vs \"informal client-friendly\")",
            "**Idioms** — verify regional phrases; Claude defaults to Manila-area patterns",
            "**Honorifics & po/opo** — Claude usually gets these right but glance over them for client-facing copy",
          ],
        } satisfies ObjectivesBoxContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.TRY_IT,
        content: {
          tag: "Try it",
          title: "Soften something real — 10 minutes",
          intro: "Find a draft you wouldn't send as-is:",
          steps: [
            "Find a sharp internal note that needs to go external",
            "Use the soften-without-flattening prompt",
            "Compare side by side — did the meaning survive?",
            "Send it (or save a draft for tomorrow)",
          ],
        } satisfies TryItContent,
      },
    ],
    quizzes: () => [
      {
        position: 1,
        question: "Your Taglish Slack thread needs to become formal client meeting minutes. What's the prompt move?",
        options: [
          "\"Translate to English\"",
          "\"Rewrite as formal English meeting minutes, structure as bullet points by topic, keep all decisions and action items\"",
          "\"Make it professional\"",
          "\"Summarize in English\"",
        ],
        correctIndex: 1,
        feedback: "Specify what to keep (decisions, actions), how to structure (bullets by topic), and the target register (formal English). Vague prompts get vague output.",
      },
      {
        position: 2,
        question: "Best way to test if a softened message kept its meaning?",
        options: [
          "Send it and see",
          "Read both side-by-side; do all the original commitments and deadlines still appear?",
          "Trust Claude",
          "Ask Claude if it kept the meaning",
        ],
        correctIndex: 1,
        feedback: "Side-by-side reading catches softening-into-vagueness. The deadline still needs to be a deadline, not a hope.",
      },
    ],
    exercise: {
      title: "Translate/tone-shift — Submission",
      instructions: {
        steps: [
          "Pick a real message that needs translating OR tone-shifting",
          "Use Claude to do the shift",
          "Read original and rewrite side by side",
          "Submit both versions + 1 sentence on what survived and what changed",
        ],
      },
    },
  };
}

// ============================================================
// MODULE 08 — Compare Two Documents
// ============================================================
function pb08(): ModuleSpec {
  const next = makeCounter();
  return {
    position: 8,
    number: "08",
    title: "Compare Two Documents.",
    subtitle: "Surface what's different between two briefs, drafts, or contracts.",
    heroSubtitle:
      "v1 vs v2 reviews are slow and error-prone by hand. Claude does the diff in 30 seconds and explains why each change matters.",
    level: ModuleLevel.FOUNDATION,
    durationMinutes: 15,
    audienceLabel: AUDIENCE,
    availableFrom: OPEN_FROM,
    learningObjectives: [
      "Diff two documents and get a meaningful summary",
      "Get Claude to flag changes by impact, not just text",
      "Catch silent changes — phrasing that looks minor but matters",
      "Decide what's worth pushing back on",
    ],
    sections: () => [
      {
        position: next(),
        number: "When to use this",
        title: "Anywhere a v1 became a v2",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Client sent revisions on a brief. Legal returned the contract. Junior teammate iterated a draft. You don't have time to re-read the whole thing — but you do need to know what actually changed and whether it matters.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: "The prompt",
        title: "Diff with impact ratings",
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "Copy this prompt",
          intro: "Don't ask for a diff — ask for an impact summary:",
          promptBlock: {
            body: "Below are two versions of the same document. Compare them and give me:\n\n  ## Substantive changes\n  Things that change the meaning, the commitment, or the deadline. For each: what changed, and why it matters (1 sentence).\n\n  ## Wording changes\n  Things that read differently but mean the same. Just list, no explanation.\n\n  ## Silent changes\n  Things that LOOK minor but might matter — softened claims, removed qualifiers, narrowed scope. Flag these.\n\n  ## Version 1\n  ---\n  [paste v1]\n  ---\n\n  ## Version 2\n  ---\n  [paste v2]\n  ---",
          },
        } satisfies ExampleCardContent,
      },
      {
        position: next(),
        number: "The silent change problem",
        title: "What to actually scan for",
        type: SectionType.OBJECTIVES_BOX,
        content: {
          label: "Common silent changes",
          items: [
            "**\"Will\" → \"may\"** or **\"will\" → \"intend to\"** — commitment downgraded",
            "**Specific number → range** — \"15 deliverables\" became \"up to 15\"",
            "**Removed qualifier** — \"with prior approval\" deleted",
            "**Narrowed scope** — \"all client channels\" became \"primary channels\"",
            "**Quietly shifted deadline language** — \"by Friday\" became \"following the review\"",
          ],
        } satisfies ObjectivesBoxContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.CALLOUT,
        content: {
          variant: "info",
          title: "Use Claude to surface, not to decide",
          body: "Claude flags the changes. You decide which ones are worth pushing back on. The decision is always yours — but the speed-up is real.",
        } satisfies CalloutContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.TRY_IT,
        content: {
          tag: "Try it",
          title: "Diff a real revision — 10 minutes",
          intro: "Find a v1/v2 pair in your inbox:",
          steps: [
            "Pick a real doc + its revision (brief, draft, contract, plan)",
            "Redact client/personal details",
            "Paste both with the diff-with-impact prompt above",
            "Read the \"silent changes\" section — anything surprise you?",
            "Decide: anything worth pushing back on?",
          ],
        } satisfies TryItContent,
      },
    ],
    quizzes: () => [
      {
        position: 1,
        question: "Why ask for three buckets (substantive / wording / silent) instead of just \"diff the documents\"?",
        options: [
          "Looks more thorough",
          "Forces Claude to separate \"changed how it reads\" from \"changed what it means\" — the distinction that matters when revising contracts and briefs",
          "Wording changes need explanation too",
          "It's the only structure Claude understands",
        ],
        correctIndex: 1,
        feedback: "The three buckets distinguish cosmetic edits from meaning-changing edits — which is exactly what you need to know when deciding whether to push back.",
      },
      {
        position: 2,
        question: "What's a silent change?",
        options: [
          "A change Claude missed",
          "A change that LOOKS minor (one word swapped) but changes the meaning or commitment",
          "Any rewording",
          "A change without comments attached",
        ],
        correctIndex: 1,
        feedback: "Silent changes are the most dangerous — \"will\" → \"may\", removed qualifiers, narrowed scope. They read the same; they aren't.",
      },
    ],
    exercise: {
      title: "Doc compare — Submission",
      instructions: {
        steps: [
          "Pick a v1/v2 pair from your work",
          "Use the diff-with-impact prompt",
          "Identify 1 substantive and 1 silent change",
          "Submit: the two changes + 1 sentence on whether they need pushback",
        ],
      },
    },
  };
}

// ============================================================
// MODULE 09 — Outline a Presentation
// ============================================================
function pb09(): ModuleSpec {
  const next = makeCounter();
  return {
    position: 9,
    number: "09",
    title: "Outline a Presentation.",
    subtitle: "From scattered notes to a 7-slide structure you can build on.",
    heroSubtitle:
      "Most decks fail at structure, not slides. Get the structure right with Claude in 5 minutes, then build the slides yourself — they're better that way.",
    level: ModuleLevel.FOUNDATION,
    durationMinutes: 15,
    audienceLabel: AUDIENCE,
    availableFrom: OPEN_FROM,
    learningObjectives: [
      "Turn messy notes into a slide-by-slide outline",
      "Decide the arc before writing any slide",
      "Pick the angle the deck should land on",
      "Build slides yourself once the structure is set",
    ],
    sections: () => [
      {
        position: next(),
        number: "When to use this",
        title: "Structure first, design later",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Don't start designing slides. Don't even open the deck. Pour everything you'd want to say into Claude and ask for an outline. Once you've got a structure you believe in, you'll knock out the slides in half the time.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: "The prompt",
        title: "Notes → outline",
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "Copy this prompt",
          intro: "Tell Claude the audience, length, and goal:",
          promptBlock: {
            body: "I need to present [topic] to [audience — e.g. \"our client's marketing team, ~6 senior people\"].\n\n  - Length: [e.g. 15 minutes, 7–9 slides]\n  - Goal: [what they should think or do after — e.g. \"approve the campaign budget\"]\n  - What I have to work with: [paste your raw notes]\n\nGive me a slide-by-slide outline. For each slide: title + one-line of what the slide is about + 2–3 supporting points. Make slide 1 set up the problem, the final slide land the ask. Don't write the slides — just outline.",
          },
        } satisfies ExampleCardContent,
      },
      {
        position: next(),
        number: "Iterate the structure",
        title: "Move slides around, then commit",
        type: SectionType.OBJECTIVES_BOX,
        content: {
          intro:
            "Don't accept the first outline. Push back to get the structure right BEFORE you build:",
          label: "Useful follow-ups",
          items: [
            "\"Swap slide 3 and 5 — flow better?\"",
            "\"Cut the slide on context — assume they have it\"",
            "\"Add a slide before the ask that addresses the obvious objection\"",
            "\"Compress to 5 slides — what loses?\"",
          ],
        } satisfies ObjectivesBoxContent,
      },
      {
        position: next(),
        number: "Then leave Claude",
        title: "Build the slides yourself",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Once the structure is locked, open the deck and build. Your slides will be sharper than Claude's would be — you know your tone, the client, the rooms you've presented in. Use Claude later if you need help phrasing one specific bullet, not for the whole slide.",
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
          tag: "Try it",
          title: "Outline a real deck — 15 minutes",
          intro: "Pick something you owe a deck for:",
          steps: [
            "Dump everything you know into a notes file",
            "Use the outline prompt with audience, length, goal",
            "Iterate the structure with 2–3 follow-ups",
            "Lock the outline",
            "Open the deck — build the first 3 slides yourself",
          ],
        } satisfies TryItContent,
      },
    ],
    quizzes: () => [
      {
        position: 1,
        question: "What's the most useful thing to lock down BEFORE asking Claude for an outline?",
        options: [
          "Slide template",
          "Audience + length + the one thing they should do or think after",
          "Brand colors",
          "Number of bullets per slide",
        ],
        correctIndex: 1,
        feedback: "Audience + length + the ask shapes everything. Without the ask, you get a generic deck.",
      },
      {
        position: 2,
        question: "After the outline, should you have Claude write the slides too?",
        options: [
          "Yes — saves time",
          "No — your slides will be sharper. Use Claude later for specific bullets if needed",
          "Only the opener",
          "Only the closer",
        ],
        correctIndex: 1,
        feedback: "Structure is the hard part. Once the arc is set, your slides will land better than Claude's would.",
      },
    ],
    exercise: {
      title: "Deck outline — Submission",
      instructions: {
        steps: [
          "Pick a real deck you owe this month",
          "Run the outline prompt with audience + length + ask",
          "Iterate the structure 2–3 times",
          "Submit: your final outline + 1 sentence on what changed from your initial instinct",
        ],
      },
    },
  };
}

// ============================================================
// MODULE 10 — Explain Something Complex
// ============================================================
function pb10(): ModuleSpec {
  const next = makeCounter();
  return {
    position: 10,
    number: "10",
    title: "Explain Something Complex.",
    subtitle: "Turn jargon into plain language for the audience that actually matters.",
    heroSubtitle:
      "Whether you're explaining campaign analytics to a client, ML basics to a junior teammate, or a technical doc to leadership — Claude is the world's most patient \"explain it like I'm not in your field\" partner.",
    level: ModuleLevel.FOUNDATION,
    durationMinutes: 15,
    audienceLabel: AUDIENCE,
    availableFrom: OPEN_FROM,
    learningObjectives: [
      "Translate technical content for non-technical audiences",
      "Pick the right analogy for the audience you're talking to",
      "Test understanding before delivering",
      "Stop using jargon you're using out of habit",
    ],
    sections: () => [
      {
        position: next(),
        number: "When to use this",
        title: "Three common cases",
        type: SectionType.OBJECTIVES_BOX,
        content: {
          label: "When this saves the most time",
          items: [
            "**Technical update to a non-technical client** — \"What does the data team's new pipeline mean for us?\"",
            "**Onboarding a junior teammate** — explain something you've internalized so deeply you forgot it was hard",
            "**Leadership briefing** — strip a 40-page report into the 1 page that matters to a CEO",
            "**Cross-team explainer** — engineering → marketing, or vice versa",
          ],
        } satisfies ObjectivesBoxContent,
      },
      {
        position: next(),
        number: "The prompt",
        title: "Explain it for the audience that matters",
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "Copy this prompt",
          intro: "The audience description is the most important part:",
          promptBlock: {
            body: "Explain [the concept] to [specific audience — e.g. \"a senior PR account manager who knows campaigns and media but has never dealt with data pipelines\"].\n\nRules:\n  - Skip jargon they wouldn't use\n  - Use one good analogy from their world\n  - Maximum 4 short paragraphs OR 1 paragraph + 5 bullets\n  - End with the one question they're most likely to ask next, and answer it",
          },
        } satisfies ExampleCardContent,
      },
      {
        position: next(),
        number: "The analogy trick",
        title: "Ask Claude to compare to something they know",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "If the explanation still feels too technical, push: ",
              s("\"Use an analogy from [their field] — what's this most like in [marketing / accounting / PR]?\""),
              " Good analogies are domain-specific. Generic ones (\"think of it like a library\") rarely land.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: "Test it",
        title: "The \"explain it back\" check",
        type: SectionType.OBJECTIVES_BOX,
        content: {
          intro:
            "Before sending an explanation, sanity-check it with Claude:",
          label: "Useful follow-ups",
          items: [
            "\"What are the 2 questions a [audience role] would most likely ask after reading this?\"",
            "\"Where would they get confused?\"",
            "\"What's the one piece of jargon I should still cut?\"",
            "\"Rewrite the opening sentence — make it grab faster\"",
          ],
        } satisfies ObjectivesBoxContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.TRY_IT,
        content: {
          tag: "Try it",
          title: "Explain something real — 10 minutes",
          intro: "Find something technical you need to explain this week:",
          steps: [
            "Pick a real thing to explain (technical concept, report, system change)",
            "Identify your audience — specifically (\"my client's CFO,\" not \"non-technical people\")",
            "Use the explain-for-audience prompt above",
            "Run the \"what would they ask?\" follow-up",
            "Send it or save the draft",
          ],
        } satisfies TryItContent,
      },
    ],
    quizzes: () => [
      {
        position: 1,
        question: "What's the most important detail in an \"explain it\" prompt?",
        options: [
          "Length",
          "A specific description of the audience — their role, what they know, what they don't",
          "Formality level",
          "Bullet vs paragraph",
        ],
        correctIndex: 1,
        feedback: "Specific audience descriptions shape everything else. \"A senior PR account manager who knows campaigns but has never dealt with data pipelines\" is far better than \"non-technical reader.\"",
      },
      {
        position: 2,
        question: "Generic analogies (\"think of it like a library\") often don't land. What's a better move?",
        options: [
          "Skip analogies entirely",
          "Ask Claude for an analogy from THEIR field (\"what's this most like in marketing?\")",
          "Use multiple analogies",
          "Use real-world examples instead",
        ],
        correctIndex: 1,
        feedback: "Domain-specific analogies land. Generic ones add words without adding understanding.",
      },
    ],
    exercise: {
      title: "Explainer — Submission",
      instructions: {
        steps: [
          "Pick something technical you need to explain to someone non-technical",
          "Describe the audience specifically in your prompt",
          "Get Claude to use one domain-specific analogy",
          "Submit: your explanation + 1 sentence on what changed when you specified the audience",
        ],
      },
    },
  };
}

// ============================================================
// Program export
// ============================================================

export const CLAUDE_PLAYBOOK_MODULES: ModuleSpec[] = [
  pb01(),
  pb02(),
  pb03(),
  pb04(),
  pb05(),
  pb06(),
  pb07(),
  pb08(),
  pb09(),
  pb10(),
];

export const CLAUDE_PLAYBOOK_PROGRAM: ProgramSpec = {
  slug: "claude-playbook",
  title: "Claude Playbook",
  subtitle:
    "Ten ways to use Claude in real work — Excel, email, meetings, research, decks, and more. Reference companion to Claude 101.",
  description:
    "A self-paced reference for the Finance + HR pilot. All 10 modules unlock together — pick any in any order. Each is one self-contained way to use Claude with the exact prompt you can copy, tips, gotchas, and a 10-minute exercise.",
  startDate: OPEN_FROM,
  endDate: new Date("2026-06-30T23:59:59Z"),
  audienceRules: {
    departments: ["Finance", "HR", "HR / L&D"],
    roles: ["EMPLOYEE", "ADMIN"],
  },
  modules: CLAUDE_PLAYBOOK_MODULES,
};
