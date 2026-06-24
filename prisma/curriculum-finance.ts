/**
 * Claude for Finance — 8 modules of role-specific playbooks for the Finance team.
 * Each module: one finance task done well with Claude, with prompts, tips, gotchas.
 */

import { ModuleLevel, SectionType } from "@prisma/client";
import type {
  CalloutContent,
  ComparisonContent,
  ExampleCardContent,
  ObjectivesBoxContent,
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
const AUDIENCE = "Pilot · Finance team";

// ============================================================
// MODULE 01 — Reconcile Transactions
// ============================================================
function fin01(): ModuleSpec {
  const next = makeCounter();
  return {
    position: 1,
    number: "01",
    title: "Reconcile Transactions.",
    subtitle:
      "Match bank/credit-card lines against the ledger and surface the outliers.",
    heroSubtitle:
      "Reconciliations are the highest-volume finance task and the most pattern-friendly. Claude doesn't do the matching — but it spots the outliers, explains the variances, and writes the reconciliation memo.",
    level: ModuleLevel.FOUNDATION,
    durationMinutes: 20,
    audienceLabel: AUDIENCE,
    availableFrom: OPEN_FROM,
    learningObjectives: [
      "Paste a bank statement + ledger extract and get a clean exception list",
      "Spot duplicate entries, FX swings, and timing differences fast",
      "Draft the reconciliation memo in your house format",
      "Know what reconciliation work to never give to Claude",
    ],
    sections: () => [
      {
        position: next(),
        number: "When to use this",
        title: "Pattern-finding, not the actual matching",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Use Sheets or your reconciliation tool to ",
              s("do the matching"),
              ". Use Claude to ",
              s("interrogate the exception list"),
              " — what's unusual, what looks like a duplicate, what looks like a timing difference, what doesn't fit either bucket.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: "Set it up",
        title: "Before you paste a statement",
        type: SectionType.OBJECTIVES_BOX,
        content: {
          label: "Redaction sweep",
          items: [
            "**Mask account numbers** — last 4 digits only",
            "**Strip personal info** in description lines (cardholder names, addresses)",
            "**Keep the amounts and dates** — Claude needs them to spot patterns",
            "**Keep vendor names** that are public — but replace any client-specific identifiers with [CLIENT]",
          ],
        } satisfies ObjectivesBoxContent,
      },
      {
        position: next(),
        number: "The prompt",
        title: "Exception triage",
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "Copy this prompt",
          intro: "Tell Claude what kind of exceptions to surface:",
          promptBlock: {
            body: "Below is the unmatched-exceptions list from this month's reconciliation between our bank statement and ledger. For each row, tell me:\n  - Likely category (timing difference / duplicate / data entry / FX / unknown)\n  - Confidence (1-5)\n  - What to look for to confirm\n\nFlag any pair of rows that look like the same transaction recorded twice (similar amount, similar date, similar description).\n\nDon't recompute totals. Don't fabricate vendor names.\n\n[paste exceptions table]",
          },
        } satisfies ExampleCardContent,
      },
      {
        position: next(),
        number: "Safety",
        title: "The audit-trail rule",
        type: SectionType.CALLOUT,
        content: {
          variant: "warn",
          title: "Claude is not the system of record.",
          body: "Every match, write-off, or adjustment goes through the reconciliation tool, with an auditable trail. Claude's role is to point you at what to look at — not to clear items.",
        } satisfies CalloutContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.TRY_IT,
        content: {
          tag: "Try it",
          title: "Triage a real exception list — 15 minutes",
          intro: "Pull this month's reconciliation exceptions:",
          steps: [
            "Redact account numbers and personal info",
            "Paste with the exception-triage prompt",
            "Pick the 3 highest-confidence \"duplicate\" pairs Claude flagged",
            "Verify against the ledger",
            "Note: how many were real?",
          ],
        } satisfies TryItContent,
      },
    ],
    quizzes: () => [
      {
        position: 1,
        question:
          "Claude says rows 12 and 47 are likely the same transaction recorded twice. What's right?",
        options: [
          "Delete one immediately — Claude found a duplicate",
          "Open both in the reconciliation tool, compare amount / date / description / vendor, then take the proper write-off path with audit trail",
          "Trust Claude and mark one as void",
          "Ignore it — Claude makes mistakes",
        ],
        correctIndex: 1,
        feedback:
          "Claude points; you verify. Every adjustment flows through the system of record with an audit trail. \"Trust but verify\" is the rule.",
      },
      {
        position: 2,
        question:
          "What's the worst finance task to give Claude?",
        options: [
          "Categorize 50 unmatched exceptions",
          "Draft the month-end reconciliation memo from your bullet notes",
          "Compute the exact unmatched-balance figure for the trial balance",
          "Spot likely duplicate entries",
        ],
        correctIndex: 2,
        feedback:
          "Exact arithmetic that goes into the books = always run in the reconciliation tool or spreadsheet. Claude describes; the system computes.",
      },
    ],
    exercise: {
      title: "Reconciliation triage — Submission",
      instructions: {
        steps: [
          "Pick a real exception list from this month's reconciliation",
          "Run the triage prompt (redact first)",
          "Verify the top 3 \"likely duplicate\" pairs Claude flagged",
          "Submit: how many were real, how many were misses",
        ],
      },
    },
  };
}

// ============================================================
// MODULE 02 — Expense Report Triage
// ============================================================
function fin02(): ModuleSpec {
  const next = makeCounter();
  return {
    position: 2,
    number: "02",
    title: "Expense Report Triage.",
    subtitle: "Categorize, spot policy breaks, surface duplicates.",
    heroSubtitle:
      "Expense reports take more reading time than any single line item is worth. Claude reads them all and flags the rows actually needing a decision.",
    level: ModuleLevel.FOUNDATION,
    durationMinutes: 15,
    audienceLabel: AUDIENCE,
    availableFrom: OPEN_FROM,
    learningObjectives: [
      "Categorize a batch of expense lines against your chart of accounts",
      "Spot policy breaks (out-of-policy meal limits, missing receipts, etc.)",
      "Catch duplicate submissions across reports",
      "Reduce reviewer time by 70% — without missing the things that matter",
    ],
    sections: () => [
      {
        position: next(),
        number: "When to use this",
        title: "Reading volume, not deciding",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "If you have to scan 40 expense lines to find the 3 that need follow-up, Claude can do the scanning. The decision on each flagged item is still yours — and so is the final approval.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: "Set it up",
        title: "Build a one-paragraph policy summary",
        type: SectionType.OBJECTIVES_BOX,
        content: {
          intro:
            "Paste your relevant policy bullets at the top so Claude has rules to apply:",
          label: "What goes in the policy paragraph",
          items: [
            "**Per-meal limits** (e.g. lunch ₱500, dinner ₱1,000)",
            "**Required receipts** (over ₱500 needs original receipt)",
            "**Approval thresholds** (over ₱5,000 needs department head pre-approval)",
            "**Non-reimbursable categories** (alcohol, personal travel)",
          ],
        } satisfies ObjectivesBoxContent,
      },
      {
        position: next(),
        number: "The prompt",
        title: "Triage with policy in context",
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "Copy this prompt",
          intro: "Paste policy first, then the expense list:",
          promptBlock: {
            body: "POLICY (Seven Generation, 2026):\n  - Per meal: lunch ₱500 max, dinner ₱1,000 max\n  - Receipts required over ₱500; missing = flagged\n  - Alcohol not reimbursable\n  - Out-of-town meal limits double\n  - Approval over ₱5,000 needs department head sign-off\n\nReview the expense report below. For each line:\n  - Suggested chart-of-accounts category\n  - Policy flag (in-policy / over-limit / missing receipt / non-reimbursable / needs-pre-approval)\n  - One-line note for the submitter if flagged\n\nAlso: flag any two lines that look like duplicates of the same expense (same vendor + same amount + within 2 days).\n\n[paste expense report]",
          },
        } satisfies ExampleCardContent,
      },
      {
        position: next(),
        number: "Gotchas",
        title: "What Claude often misreads",
        type: SectionType.OBJECTIVES_BOX,
        content: {
          label: "Sanity-check these flags",
          items: [
            "**Out-of-town vs. in-town** — Claude may not infer location correctly; verify before doubling limits",
            "**Per-person meal cost** for group meals — Claude needs the headcount to compute correctly",
            "**Currency conversion** — never trust Claude's FX math; rerun in your tool",
            "**Vendor name variants** — \"Coffee Bean\" vs \"The Coffee Bean & Tea Leaf\" can confuse duplicate detection",
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
          title: "Triage a real expense report — 10 minutes",
          intro: "Find an expense report in your queue:",
          steps: [
            "Build the 4-bullet policy paragraph",
            "Paste with the triage prompt",
            "Verify the 2-3 highest-priority flags Claude raised",
            "Compare against what you'd have caught manually",
            "Note your time saved",
          ],
        } satisfies TryItContent,
      },
    ],
    quizzes: () => [
      {
        position: 1,
        question:
          "Why paste the policy paragraph at the top of the prompt?",
        options: [
          "Looks more professional",
          "Claude can only flag policy breaks if it knows the policy — pasted policy is far better than 'use your own judgment'",
          "Saves tokens",
          "Required by the tool",
        ],
        correctIndex: 1,
        feedback:
          "Without the policy in context, Claude guesses based on training. With the policy in context, Claude applies YOUR specific rules consistently.",
      },
      {
        position: 2,
        question:
          "Claude says lines 12 and 17 are likely duplicates (₱1,200 at Starbucks on consecutive days). What's right?",
        options: [
          "Reject both",
          "Approve both — different days",
          "Open both, check time-stamp and meeting context; if same meeting was double-charged, ask the submitter",
          "Trust Claude and reject one",
        ],
        correctIndex: 2,
        feedback:
          "Pattern-flag from Claude, decision from you. Don't auto-reject — get the context first. The submitter can usually clarify in one Slack message.",
      },
    ],
    exercise: {
      title: "Expense triage — Submission",
      instructions: {
        steps: [
          "Pick a real expense report in your queue",
          "Build the policy paragraph + run the triage prompt",
          "Apply the flags + your judgment to approve/reject lines",
          "Submit: time vs. your usual review",
        ],
      },
    },
  };
}

// ============================================================
// MODULE 03 — Budget Variance Explanations
// ============================================================
function fin03(): ModuleSpec {
  const next = makeCounter();
  return {
    position: 3,
    number: "03",
    title: "Budget Variance Explanations.",
    subtitle: "Turn variance reports into 3-sentence narratives leadership reads.",
    heroSubtitle:
      "The actual-vs-budget number is in the report. The story behind it is in your head. Claude helps you write that story in the format leadership actually reads.",
    level: ModuleLevel.FOUNDATION,
    durationMinutes: 15,
    audienceLabel: AUDIENCE,
    availableFrom: OPEN_FROM,
    learningObjectives: [
      "Pull the 3-5 biggest variances into a leadership-ready summary",
      "Separate \"explained\" variances from \"need to investigate\"",
      "Write the narrative in your house format",
      "Avoid inventing reasons — Claude won't know causes unless you tell it",
    ],
    sections: () => [
      {
        position: next(),
        number: "When to use this",
        title: "After you know the why, not before",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              s("Claude doesn't know why your office supplies budget overran"),
              ". You know — because Maria mentioned the printer broke. Claude's job is to take what you know and write it in the format leadership reads, in the voice you'd use.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: "The prompt",
        title: "Variances + causes → narrative",
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "Copy this prompt",
          intro: "Paste the variances + your one-line reason per variance:",
          promptBlock: {
            body: "Below are this month's top 5 budget variances with the cause I know.\n\n  | Line | Budget | Actual | Variance | Cause (mine) |\n  | Office supplies | ₱25,000 | ₱48,000 | +92% | Printer breakdown, replaced in-month |\n  | Travel | ₱120,000 | ₱65,000 | -46% | Two trips deferred to next month |\n  | ... (paste yours)\n\nWrite a 3-paragraph variance commentary for the monthly management report:\n  - Paragraph 1: overall picture in one sentence + the 2 most material variances\n  - Paragraph 2: explained variances with attribution\n  - Paragraph 3: items still under investigation, if any\n\nTone: clear, non-defensive, leadership-friendly. Don't invent causes.",
          },
        } satisfies ExampleCardContent,
      },
      {
        position: next(),
        number: "Gotchas",
        title: "The 'don't invent' rule",
        type: SectionType.CALLOUT,
        content: {
          variant: "warn",
          title: "If you didn't tell Claude the cause, it might guess one.",
          body: "Always include a \"Cause\" column. If you genuinely don't know yet, write \"under investigation\" — never leave blank. Claude fills blanks with plausible-sounding fiction.",
        } satisfies CalloutContent,
      },
      {
        position: next(),
        number: "Make it yours",
        title: "Anchor the tone with last month's commentary",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "If you already have a house format, paste last month's commentary as a tone anchor: \"Write in the same voice as this prior commentary.\" Claude matches structure and tone better from an example than from adjectives.",
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
          title: "Draft this month's commentary — 15 minutes",
          intro: "Pull the variance report you owe leadership:",
          steps: [
            "Identify the top 5 variances",
            "Write a one-line cause for each (use \"under investigation\" if you don't know)",
            "Paste with the variance-narrative prompt",
            "Read the 3 paragraphs — anything wrong? Edit",
            "Compare to your usual draft time",
          ],
        } satisfies TryItContent,
      },
    ],
    quizzes: () => [
      {
        position: 1,
        question:
          "Claude's draft says office supplies overran \"due to seasonal demand spikes.\" You didn't tell it that. What's the right move?",
        options: [
          "Leave it — sounds plausible",
          "Replace with the actual cause you know; if you didn't know, replace with \"under investigation\"",
          "Ask Claude to be more specific",
          "Send as-is",
        ],
        correctIndex: 1,
        feedback:
          "This is invented causation — the biggest risk in variance reporting. Never let Claude guess at causes. \"Under investigation\" beats fiction.",
      },
      {
        position: 2,
        question:
          "Best way to match the tone of your monthly management report?",
        options: [
          "Tell Claude \"write in a corporate tone\"",
          "Paste last month's commentary as a tone anchor",
          "Use lots of bullet points",
          "Stick to short sentences",
        ],
        correctIndex: 1,
        feedback:
          "An example beats adjectives. Claude matches patterns from real samples far better than from style adjectives.",
      },
    ],
    exercise: {
      title: "Variance commentary — Submission",
      instructions: {
        steps: [
          "Pick this month's actual variance report",
          "Run the variance-narrative prompt with real causes",
          "Submit: your final commentary + 1 sentence on what Claude got wrong (or didn't)",
        ],
      },
    },
  };
}

// ============================================================
// MODULE 04 — AP/AR Aging Action Lists
// ============================================================
function fin04(): ModuleSpec {
  const next = makeCounter();
  return {
    position: 4,
    number: "04",
    title: "AP/AR Aging → Action Lists.",
    subtitle: "Aged-receivables tables become prioritized call lists in 60 seconds.",
    heroSubtitle:
      "Aging reports are pure data. The work is figuring out who to call first. Claude does the sorting and drafts the first three messages.",
    level: ModuleLevel.FOUNDATION,
    durationMinutes: 15,
    audienceLabel: AUDIENCE,
    availableFrom: OPEN_FROM,
    learningObjectives: [
      "Convert a raw aging report into a prioritized action list",
      "Draft the first-touch collection email in your voice",
      "Spot the accounts that need a relationship call, not an email",
      "Hand off the calculations to your AR system",
    ],
    sections: () => [
      {
        position: next(),
        number: "When to use this",
        title: "Sorting + drafting, not calculating",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Your AR system computes the aging buckets. Claude reads the result and turns it into ",
              s("a triage list with first-touch drafts ready to send"),
              ". You decide who to actually contact and personalize the drafts where needed.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: "The prompt",
        title: "Prioritize + draft",
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "Copy this prompt",
          intro: "Tell Claude the priority rule + ask for drafts:",
          promptBlock: {
            body: "Below is our AR aging report. Priority rule:\n  - 60+ days overdue: highest, especially if >₱100K\n  - 30-60 days overdue: medium\n  - Under 30: monitor only\n  - Existing client with multiple open invoices: bundle into one outreach\n\nFor each priority-1 account, draft a friendly first-touch email:\n  - Reference the specific invoices (amount + date)\n  - Polite tone — assume the delay is unintentional\n  - One specific ask (status update + expected payment date)\n  - Sign-off as \"the Seven Generation AR team\"\n\nDon't compute new totals. Use the amounts shown.\n\n[paste aging report — redact client names if pasting outside our finance team]",
          },
        } satisfies ExampleCardContent,
      },
      {
        position: next(),
        number: "Sometimes the email isn't right",
        title: "When to call instead",
        type: SectionType.OBJECTIVES_BOX,
        content: {
          intro: "Some accounts need a call, not another email. Ask Claude to flag:",
          label: "Flag for a call when…",
          items: [
            "**90+ days overdue** — email cycle has run; escalation needed",
            "**Largest 3 amounts** — relationship preservation matters",
            "**Disputed amounts** — email won't resolve",
            "**Strategic client** — even small overdue amounts deserve a personal touch",
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
          title: "Personalize before sending.",
          body: "Claude's first-touch draft is a starting point. Read it through, add the personal context (\"hope your daughter's recital went well\"), then send. The relationship is yours, not Claude's.",
        } satisfies CalloutContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.TRY_IT,
        content: {
          tag: "Try it",
          title: "Process this week's aging — 15 minutes",
          intro: "Pull the current AR aging report:",
          steps: [
            "Redact if needed",
            "Run the prioritize-and-draft prompt",
            "Read the priority-1 list — agree with the order?",
            "Personalize one email, send it",
            "Note: how long did the whole pass take?",
          ],
        } satisfies TryItContent,
      },
    ],
    quizzes: () => [
      {
        position: 1,
        question:
          "Claude drafts a first-touch email for a 60-day overdue invoice of ₱1.2M from a strategic client. Send as-is?",
        options: [
          "Yes — Claude knows finance language",
          "No — large amounts and strategic relationships need a call, not another email; use the draft to prep talking points instead",
          "Yes — but copy the CFO",
          "Resend to a different recipient",
        ],
        correctIndex: 1,
        feedback:
          "Large + strategic = relationship call. Use Claude's draft as talking-point prep, not as outgoing copy.",
      },
      {
        position: 2,
        question:
          "Should Claude compute the total amount overdue across all accounts in the aging report?",
        options: [
          "Yes — saves time",
          "No — never let Claude do the totals that go into a published number; the AR system computes",
          "Only for under ₱100K",
          "Only if the receivables are in PHP",
        ],
        correctIndex: 1,
        feedback:
          "Same rule as Module 06 of the original Playbook — Claude describes; the system computes. Never publish a Claude-calculated total.",
      },
    ],
    exercise: {
      title: "Aging → action list — Submission",
      instructions: {
        steps: [
          "Run this week's AR aging through the prompt",
          "Personalize + send one first-touch email",
          "Note 1 account you'll call instead of email — and why",
          "Submit: your priority-1 list and which one you'd call",
        ],
      },
    },
  };
}

// ============================================================
// MODULE 05 — Vendor Invoice Categorization
// ============================================================
function fin05(): ModuleSpec {
  const next = makeCounter();
  return {
    position: 5,
    number: "05",
    title: "Vendor Invoice Categorization.",
    subtitle: "GL coding + approval routing at the speed of a paste.",
    heroSubtitle:
      "Vendor invoices arrive uncategorized. Coding them to the right GL account is mechanical pattern matching — exactly Claude's wheelhouse.",
    level: ModuleLevel.FOUNDATION,
    durationMinutes: 15,
    audienceLabel: AUDIENCE,
    availableFrom: OPEN_FROM,
    learningObjectives: [
      "Categorize a batch of invoices against your chart of accounts",
      "Identify likely cost-center allocations",
      "Route invoices by approval threshold automatically",
      "Catch invoices that need an exception conversation",
    ],
    sections: () => [
      {
        position: next(),
        number: "When to use this",
        title: "First-pass coding, not final approval",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Claude can take a list of incoming invoices and produce a first-pass GL coding + cost-center allocation. Your job is to review, correct the misses, and approve. The category mapping is mechanical; the judgment is yours.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: "Set it up",
        title: "Your chart of accounts in 10 lines",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Don't paste the whole COA. ",
              s("Paste the 10-15 accounts you actually use for vendor invoices"),
              " — IT, office supplies, professional services, travel, marketing, etc. — with one-line descriptions. Same goes for cost centers — paste your active 10, not all 50.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: "The prompt",
        title: "Code + route",
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "Copy this prompt",
          intro: "Paste your accounts list + the invoice batch:",
          promptBlock: {
            body: "Chart of accounts (active for vendor invoices):\n  - 6010 — IT software & licenses\n  - 6020 — IT hardware\n  - 6100 — Professional services (legal, audit, consulting)\n  - 6200 — Office supplies\n  - 6300 — Travel\n  - 6400 — Marketing\n  - 6500 — Subscriptions (non-IT)\n  - 6900 — Other (use only if no match)\n\nCost centers: M2-OPS, MMI-OPS, RDB-OPS, 7GEN-SHARED\n\nApproval routing:\n  - Under ₱50K → AP processor\n  - ₱50K-₱200K → Department head\n  - Over ₱200K → CFO\n\nFor each invoice below, give me:\n  | Vendor | Amount | Suggested GL | Suggested cost center | Routing | Confidence (1-5) | Note if confidence under 4 |\n\nFlag any vendor we haven't seen before (mention in the note).\n\n[paste invoice batch]",
          },
        } satisfies ExampleCardContent,
      },
      {
        position: next(),
        number: "Gotchas",
        title: "Cost-center is the harder call",
        type: SectionType.OBJECTIVES_BOX,
        content: {
          label: "Common cost-center mistakes",
          items: [
            "**Shared services** (legal, audit, IT) — easy to misallocate; default to 7GEN-SHARED unless invoice references a specific entity",
            "**Cross-charged invoices** — paid by M2 but for an MMI project; needs the project lead's input",
            "**New vendors** — Claude can't know which cost center until you've coded one or two invoices for that vendor",
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
          title: "Code a real batch — 15 minutes",
          intro: "Pull this week's incoming invoices:",
          steps: [
            "Build the COA + cost-center + routing reference paragraph",
            "Paste with the code-and-route prompt",
            "Review the confidence-4-or-under rows first",
            "Approve / override / hold based on your read",
            "Note: time vs. your usual coding pass",
          ],
        } satisfies TryItContent,
      },
    ],
    quizzes: () => [
      {
        position: 1,
        question:
          "Why paste only your 10-15 active GL accounts instead of the whole 200-line COA?",
        options: [
          "Saves tokens",
          "Forces Claude to pick from your real options — full COA invites it to suggest accounts you never use, which means more overrides for you",
          "Required by the prompt",
          "Speeds up Claude's response",
        ],
        correctIndex: 1,
        feedback:
          "Constraining the choice set to what you actually use raises Claude's first-pass accuracy a lot. Same principle as audience-specific examples in the original Playbook.",
      },
      {
        position: 2,
        question:
          "Claude codes a ₱180K invoice to 6100 (Professional services) with confidence 5, and routes to Department head. Sign off?",
        options: [
          "Yes — confidence 5 means trustworthy",
          "Glance over to confirm vendor + amount + GL match what you'd pick; trust-but-verify even on high-confidence rows",
          "No — anything over ₱100K needs hand-coding",
          "Yes — but copy the CFO",
        ],
        correctIndex: 1,
        feedback:
          "Confidence 5 is a hint, not a free pass. A 5-second eyeball check on a high-confidence row is cheap insurance against the occasional wrong call.",
      },
    ],
    exercise: {
      title: "Invoice batch coding — Submission",
      instructions: {
        steps: [
          "Pull this week's incoming invoice batch",
          "Build the COA + cost-center paragraph",
          "Run the code-and-route prompt",
          "Process the batch (approve / override) — note any patterns of misses",
          "Submit: count processed + count overridden",
        ],
      },
    },
  };
}

// ============================================================
// MODULE 06 — Audit Prep Q&A
// ============================================================
function fin06(): ModuleSpec {
  const next = makeCounter();
  return {
    position: 6,
    number: "06",
    title: "Audit Prep Q&A.",
    subtitle: "Draft responses to auditor questions — fast, traceable, defensible.",
    heroSubtitle:
      "Auditors ask the same families of questions every year. Claude drafts your first response from your supporting docs — you verify the numbers and tighten the language.",
    level: ModuleLevel.INTERMEDIATE,
    durationMinutes: 20,
    audienceLabel: AUDIENCE,
    availableFrom: OPEN_FROM,
    learningObjectives: [
      "Draft an audit response from your supporting documentation",
      "Match each claim to its source document trail",
      "Spot where the response needs more support before going out",
      "Never let Claude state a number without you verifying it",
    ],
    sections: () => [
      {
        position: next(),
        number: "When to use this",
        title: "Drafting, never asserting",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Audit responses are ",
              s("legal documents"),
              ". Every number, every reference, every claim gets scrutinized. Claude drafts; you verify every single citation against the source. No shortcuts.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: "The prompt",
        title: "Draft + cite from your docs",
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "Copy this prompt",
          intro: "Paste the question + your relevant docs/notes:",
          promptBlock: {
            body: "AUDITOR QUESTION:\n  [paste the question verbatim]\n\nMY SUPPORTING NOTES / DOCUMENTS:\n  [paste your notes, ledger extracts, policy excerpts, etc.]\n\nDraft a response that:\n  - Answers the question directly in the first sentence\n  - Cites the specific supporting documents I referenced (use [Doc 1], [Doc 2] etc. — I'll fill in real refs)\n  - Notes any limitations or qualifications honestly\n  - Stays in passive professional voice\n  - Doesn't introduce facts that aren't in my notes\n\nIf the question can't be fully answered from my notes, flag what's missing.",
          },
        } satisfies ExampleCardContent,
      },
      {
        position: next(),
        number: "Safety",
        title: "Verify every number",
        type: SectionType.CALLOUT,
        content: {
          variant: "warn",
          title: "Claude can confidently misstate a number.",
          body: "Before any draft response goes out, open every source document and confirm every number Claude included. Audit responses with wrong numbers create much bigger problems than slower-drafted ones.",
        } satisfies CalloutContent,
      },
      {
        position: next(),
        number: "When to flag",
        title: "What \"can't be fully answered\" looks like",
        type: SectionType.OBJECTIVES_BOX,
        content: {
          label: "Flag for follow-up when…",
          items: [
            "**Source documents don't exist** — you need to escalate to the document owner",
            "**Numbers don't reconcile** between your notes and the books — investigate before drafting",
            "**Policy reference is ambiguous** — check with the policy owner",
            "**Question implies a process you don't follow** — clarify with the auditor before drafting",
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
          title: "Draft one real audit response — 20 minutes",
          intro: "Pull a real auditor question (current or last cycle):",
          steps: [
            "Pull together your supporting notes",
            "Run the draft prompt",
            "Verify every number against source documents",
            "Edit the language for your house style",
            "Compare to your usual drafting time",
          ],
        } satisfies TryItContent,
      },
    ],
    quizzes: () => [
      {
        position: 1,
        question:
          "Claude's draft cites a ₱2.4M write-off in 2025 Q3. Your supporting notes say it was Q4. Right move?",
        options: [
          "Trust Claude — it might have read more carefully",
          "Edit to Q4 in the draft, then verify against your ledger one more time before sending",
          "Send as-is — auditor will catch it",
          "Ask Claude which quarter it was",
        ],
        correctIndex: 1,
        feedback:
          "Trust your source, not Claude's interpretation. A number wrong in an audit response is much worse than spending 30 extra seconds verifying.",
      },
      {
        position: 2,
        question:
          "Best practice when an audit question can't be fully answered from your notes?",
        options: [
          "Have Claude make up a plausible answer",
          "Have Claude write \"the company believes\" and move on",
          "Stop drafting; identify the gap; escalate to whoever owns the missing info",
          "Skip the question",
        ],
        correctIndex: 2,
        feedback:
          "Audit responses cannot have gaps filled in by Claude. Gap → escalate → re-draft. Slower up front, much safer downstream.",
      },
    ],
    exercise: {
      title: "Audit response draft — Submission",
      instructions: {
        steps: [
          "Pick a real audit question (current or prior year)",
          "Run the draft prompt with your supporting notes",
          "Verify every number against source documents",
          "Submit: draft response + 1 sentence on what verification caught",
        ],
      },
    },
  };
}

// ============================================================
// MODULE 07 — Financial Reports → Plain Language
// ============================================================
function fin07(): ModuleSpec {
  const next = makeCounter();
  return {
    position: 7,
    number: "07",
    title: "Reports → Plain Language.",
    subtitle: "Explain financial reports to non-finance leadership.",
    heroSubtitle:
      "P&L moves matter to leadership. The language of finance often doesn't. Claude translates between them — without losing the precision that matters.",
    level: ModuleLevel.INTERMEDIATE,
    durationMinutes: 15,
    audienceLabel: AUDIENCE,
    availableFrom: OPEN_FROM,
    learningObjectives: [
      "Translate ratio analysis into plain-language commentary",
      "Pick the right analogy for the non-finance leader you're briefing",
      "Avoid losing precision while reducing jargon",
      "Test understanding before sending",
    ],
    sections: () => [
      {
        position: next(),
        number: "When to use this",
        title: "When leadership says \"explain it simply\"",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Boards, founders, account managers — most people who'll read your reports aren't accountants. The translation work is constant. Claude does the first pass; you keep the precision.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: "The prompt",
        title: "Audience-specific explainer",
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "Copy this prompt",
          intro: "The audience description is most of the work:",
          promptBlock: {
            body: "Explain the [specific finance concept — e.g. \"current-ratio drop from 1.8 to 1.4\"] to [audience — e.g. \"our M2 account director, who knows campaigns and clients but has never analyzed a balance sheet\"].\n\nRules:\n  - 4 short paragraphs OR 1 paragraph + 5 bullets\n  - Skip jargon they wouldn't use\n  - Use one analogy from their world (PR / client work / campaign management)\n  - End with the one question they'll most likely ask, and answer it\n  - Don't oversimplify the numbers — keep the precision\n\nHere's the supporting data:\n  [paste relevant ratios, numbers, context]",
          },
        } satisfies ExampleCardContent,
      },
      {
        position: next(),
        number: "Gotchas",
        title: "Where translations go wrong",
        type: SectionType.OBJECTIVES_BOX,
        content: {
          label: "Sanity-check these",
          items: [
            "**Lost precision** — \"about half\" replacing \"47%\" loses information",
            "**Wrong analogy** — Claude defaults to generic (\"think of it like a budget\"); push for domain-specific",
            "**Overconfident summaries** — \"this means we're in trouble\" — let leadership draw conclusions",
            "**Skipped caveats** — financial commentary often needs \"however\" clauses; Claude likes simple stories",
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
          title: "Translate one real report — 10 minutes",
          intro: "Pick a real conversation you have coming up:",
          steps: [
            "Identify the specific concept to explain + the audience",
            "Run the audience-specific explainer prompt",
            "Check for lost precision and wrong analogies",
            "Test by asking Claude \"what would they ask after reading this?\"",
            "Send (or save the draft)",
          ],
        } satisfies TryItContent,
      },
    ],
    quizzes: () => [
      {
        position: 1,
        question:
          "Claude rewrites \"working-capital ratio dropped from 1.8 to 1.4\" as \"our cash position is tighter than before.\" Send?",
        options: [
          "Yes — simpler is better",
          "No — \"our cash position is tighter\" is vague and loses the actual number; rewrite to keep both the simplicity and the precision",
          "Yes — but copy the CFO",
          "Yes — leadership doesn't care about exact ratios",
        ],
        correctIndex: 1,
        feedback:
          "Plain language ≠ vague. The right version says BOTH \"working-capital ratio dropped from 1.8 to 1.4\" AND \"meaning we have less cushion between current assets and current liabilities.\" Precision + interpretation.",
      },
      {
        position: 2,
        question:
          "The most important detail in the audience description?",
        options: [
          "Their seniority",
          "Their actual job context — what they know from their day-to-day, not their org chart",
          "Their preferred communication style",
          "Their entity (M2 / MMI / RDB)",
        ],
        correctIndex: 1,
        feedback:
          "\"Account director who knows campaigns but never reads a balance sheet\" gives Claude the right analogies. \"Senior leader\" doesn't.",
      },
    ],
    exercise: {
      title: "Plain-language briefing — Submission",
      instructions: {
        steps: [
          "Pick a real upcoming conversation",
          "Identify the concept + describe the audience specifically",
          "Run the prompt; check for lost precision",
          "Submit: your explainer + 1 sentence on what changed when you specified the audience",
        ],
      },
    },
  };
}

// ============================================================
// MODULE 08 — KPI Dashboard Commentary
// ============================================================
function fin08(): ModuleSpec {
  const next = makeCounter();
  return {
    position: 8,
    number: "08",
    title: "KPI Dashboard Commentary.",
    subtitle: "The narrative under each chart, written in your voice.",
    heroSubtitle:
      "Dashboards show the numbers. The story under each chart is the work. Claude writes the first pass — you keep the judgment.",
    level: ModuleLevel.INTERMEDIATE,
    durationMinutes: 15,
    audienceLabel: AUDIENCE,
    availableFrom: OPEN_FROM,
    learningObjectives: [
      "Draft the commentary block for each KPI in your monthly pack",
      "Avoid generic \"we're trending positively\" filler",
      "Match the tone of your house dashboard format",
      "Flag KPIs where the narrative actually needs investigation",
    ],
    sections: () => [
      {
        position: next(),
        number: "When to use this",
        title: "Recurring narratives are gold for Claude",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "If you write a 2-sentence commentary under each chart in your monthly pack, that's a candidate. The structure repeats; only the data changes. Save the prompt once, reuse forever.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: "The prompt",
        title: "Per-KPI commentary in your house style",
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "Copy this prompt",
          intro: "Anchor the tone with one of your previous commentaries:",
          promptBlock: {
            body: "Here's one of last month's KPI commentary blocks as my tone anchor:\n\n  ---\n  [paste a previous commentary you wrote — 2-3 sentences]\n  ---\n\nThis month, for each KPI below, write a 2-sentence commentary in the same voice:\n  - Sentence 1: what changed (direction + magnitude)\n  - Sentence 2: why (use the cause I provide; flag if no cause given)\n\nKPIs (KPI | last month | this month | cause):\n  | Gross margin | 38% | 41% | shift to higher-margin retainer mix |\n  | Days sales outstanding | 47 | 53 | two large clients delayed; collections in progress |\n  | ... (paste yours)\n\nIf cause is blank, write \"under investigation\" — do not guess.",
          },
        } satisfies ExampleCardContent,
      },
      {
        position: next(),
        number: "Save the prompt",
        title: "This is a 'once' prompt",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Once you've tuned this prompt to your house style, ",
              s("save it as a template"),
              ". Every month, you only update the KPI rows and the cause column. The prompt itself becomes part of your monthly close routine.",
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
          variant: "info",
          title: "Generic commentary is worse than no commentary.",
          body: "\"Performance trended positively this month\" is filler. If you can't write a specific reason, write \"under investigation\" instead. The leadership team learns to trust the report when the commentary actually means something.",
        } satisfies CalloutContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.TRY_IT,
        content: {
          tag: "Try it",
          title: "Draft this month's KPI commentary — 15 minutes",
          intro: "Pull this month's KPI table:",
          steps: [
            "Pick a previous commentary as your tone anchor",
            "Fill in the cause column with what you actually know",
            "Run the prompt",
            "Save the prompt as your monthly template",
            "Submit the final pack — note time vs. doing it from scratch",
          ],
        } satisfies TryItContent,
      },
    ],
    quizzes: () => [
      {
        position: 1,
        question:
          "Best way to keep Claude's KPI commentary in your house voice?",
        options: [
          "Use words like \"professional\" and \"clear\"",
          "Paste one of your previous commentaries as a tone anchor",
          "Tell Claude to be concise",
          "Use bullet points",
        ],
        correctIndex: 1,
        feedback:
          "Examples beat adjectives. A real previous commentary gives Claude the pattern to match.",
      },
      {
        position: 2,
        question:
          "DSO jumped from 47 to 53 and you don't know why yet. What does your prompt say?",
        options: [
          "Let Claude come up with a plausible reason",
          "\"Under investigation\"",
          "\"Seasonal fluctuation\"",
          "Leave the cause blank",
        ],
        correctIndex: 1,
        feedback:
          "\"Under investigation\" is honest and signals to leadership that you're on it. Plausible-but-invented reasons erode trust the moment one gets caught.",
      },
    ],
    exercise: {
      title: "KPI commentary — Submission",
      instructions: {
        steps: [
          "Pull this month's KPI dashboard",
          "Build the prompt with a tone anchor",
          "Generate commentary; replace any \"under investigation\" with real causes once you know",
          "Save the prompt as your monthly template",
          "Submit: the final commentary block",
        ],
      },
    },
  };
}

// ============================================================
// Program export
// ============================================================

export const CLAUDE_FINANCE_MODULES: ModuleSpec[] = [
  fin01(),
  fin02(),
  fin03(),
  fin04(),
  fin05(),
  fin06(),
  fin07(),
  fin08(),
];

export const CLAUDE_FINANCE_PROGRAM: ProgramSpec = {
  slug: "claude-for-finance",
  title: "Claude for Finance",
  subtitle:
    "Eight role-specific playbooks — reconciliations, expenses, variances, AP/AR, invoices, audit, reports, KPIs.",
  description:
    "Tailored to the Finance team's day-to-day. Each module is one common finance task done well with Claude — the exact prompt, the gotchas, and the safety rules.",
  startDate: OPEN_FROM,
  endDate: new Date("2026-06-30T23:59:59Z"),
  audienceRules: {
    departments: ["Finance"],
    roles: ["EMPLOYEE", "ADMIN"],
  },
  modules: CLAUDE_FINANCE_MODULES,
};
