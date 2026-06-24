/**
 * Claude for HR — 8 modules of role-specific playbooks for the HR team.
 * Each module: one HR task done well with Claude, with prompts, tips, gotchas.
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
const AUDIENCE = "Pilot · HR team";

// ============================================================
// MODULE 01 — Write Job Descriptions
// ============================================================
function hr01(): ModuleSpec {
  const next = makeCounter();
  return {
    position: 1,
    number: "01",
    title: "Write Job Descriptions.",
    subtitle: "From scattered hiring-manager notes to a posting that attracts the right people.",
    heroSubtitle:
      "JDs done badly attract everyone (and the wrong everyone). JDs done well attract a focused shortlist. Claude turns rough notes into a posting in 5 minutes — then you tune it.",
    level: ModuleLevel.FOUNDATION,
    durationMinutes: 15,
    audienceLabel: AUDIENCE,
    availableFrom: OPEN_FROM,
    learningObjectives: [
      "Turn hiring-manager notes into a coherent JD draft",
      "Separate must-haves from nice-to-haves",
      "Match tone to the seniority of the role",
      "Strip biased language without losing precision",
    ],
    sections: () => [
      {
        position: next(),
        number: "When to use this",
        title: "Drafting fast, then tuning",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "The slowest part of writing a JD isn't typing — it's ",
              s("organizing what the hiring manager actually meant"),
              ". Claude does that organizing in 60 seconds. You then bring the hiring-manager-specific judgment.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: "Set it up",
        title: "Get the hiring manager's notes",
        type: SectionType.OBJECTIVES_BOX,
        content: {
          intro: "Before drafting, ask the hiring manager 4 questions:",
          label: "Mini-intake (10 min)",
          items: [
            "**The job in one sentence** — what does success in this role look like?",
            "**Must-haves** — what would disqualify a candidate immediately?",
            "**Nice-to-haves** — what would tip the scale between two strong candidates?",
            "**The team they'd join** — who else does what, how is the work shared?",
          ],
        } satisfies ObjectivesBoxContent,
      },
      {
        position: next(),
        number: "The prompt",
        title: "Notes → posting draft",
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "Copy this prompt",
          intro: "Paste your intake notes + the job-board section structure:",
          promptBlock: {
            body: "Write a job description for [role title] at Seven Generation Group, based on these intake notes:\n\n  ---\n  [paste the hiring manager's notes]\n  ---\n\nStructure:\n  - About Seven Generation (2 sentences — tell me what to use)\n  - About the role (3-4 sentences, what success looks like)\n  - What you'll do (5-7 bullets, action-led)\n  - What you'll bring (separate Must-haves from Nice-to-haves)\n  - How we work (1 paragraph on team / culture cues from the notes)\n  - How to apply (placeholder I'll fill in)\n\nTone: warm but specific. No \"rockstar\" or \"ninja\" language. No gendered terms. Skip generic platitudes (\"great opportunity\", \"innovative environment\").\n\nFlag any claim in the notes you couldn't translate into the JD — I'll follow up with the hiring manager.",
          },
        } satisfies ExampleCardContent,
      },
      {
        position: next(),
        number: "Bias check",
        title: "Strip the language that narrows the funnel",
        type: SectionType.OBJECTIVES_BOX,
        content: {
          label: "Common things to rewrite",
          items: [
            "**Gendered terms** — \"he/she\" → \"you\" or \"the candidate\"",
            "**Aggressive verbs** — \"crush\", \"dominate\", \"hunt\"",
            "**Excessive years** — \"10+ years\" often filters out 8-year candidates who'd thrive",
            "**Generic seniority signals** — \"rockstar\", \"ninja\", \"guru\", \"unicorn\"",
            "**Unnecessary degree requirements** — only require when the job actually requires it",
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
          title: "Draft one real JD — 15 minutes",
          intro: "Pick a role you're hiring for this month:",
          steps: [
            "Do the 10-min intake with the hiring manager",
            "Run the JD prompt",
            "Strip biased / inflated language",
            "Confirm Must-have vs Nice-to-have with the hiring manager",
            "Note: time vs. your usual JD drafting",
          ],
        } satisfies TryItContent,
      },
    ],
    quizzes: () => [
      {
        position: 1,
        question:
          "Why separate Must-haves from Nice-to-haves in the JD?",
        options: [
          "Looks more professional",
          "Strong candidates self-disqualify if Nice-to-haves look like requirements; you also save your team time on screening",
          "Required by job boards",
          "Saves Claude tokens",
        ],
        correctIndex: 1,
        feedback:
          "Pile of \"requirements\" → strong candidates assume they're not qualified and don't apply. Explicit must-vs-nice = wider, better-fit funnel.",
      },
      {
        position: 2,
        question:
          "Hiring manager said \"need a rockstar\". Best JD treatment?",
        options: [
          "Use the word — captures their enthusiasm",
          "Translate: ask the hiring manager what \"rockstar\" means concretely (high-output? specific track record?), then write that",
          "Replace with \"highly motivated\"",
          "Skip it",
        ],
        correctIndex: 1,
        feedback:
          "Vague enthusiasm = vague JD = vague applicants. Get to the specific thing behind the buzzword.",
      },
    ],
    exercise: {
      title: "Job description — Submission",
      instructions: {
        steps: [
          "Pick a real open role",
          "Do the 4-question intake with the hiring manager",
          "Draft with Claude, then strip biased language",
          "Submit: the final JD + 1 sentence on what the intake revealed that the original ask missed",
        ],
      },
    },
  };
}

// ============================================================
// MODULE 02 — Interview Question Sets
// ============================================================
function hr02(): ModuleSpec {
  const next = makeCounter();
  return {
    position: 2,
    number: "02",
    title: "Interview Question Sets.",
    subtitle: "Skill-anchored, fair, and tailored to the actual JD.",
    heroSubtitle:
      "Generic interview questions get generic answers. Skill-anchored questions tied to the JD reveal who can actually do the work. Claude generates a starter set; you sharpen it.",
    level: ModuleLevel.FOUNDATION,
    durationMinutes: 15,
    audienceLabel: AUDIENCE,
    availableFrom: OPEN_FROM,
    learningObjectives: [
      "Generate role-specific interview questions from the JD",
      "Cover technical skill + collaboration + judgment in one set",
      "Avoid questions that filter for demographic factors over ability",
      "Give interviewers a scoring rubric to keep the bar consistent",
    ],
    sections: () => [
      {
        position: next(),
        number: "When to use this",
        title: "Tied to a specific JD, not generic",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "The JD is the spec; the interview is the test. If the JD lists 5 things the role does, the interview should reveal whether the candidate can do those 5 things. Claude maps one to the other.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: "The prompt",
        title: "JD → question set + rubric",
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "Copy this prompt",
          intro: "Paste the JD; ask for questions and a rubric:",
          promptBlock: {
            body: "Below is the JD for [role]. For each Must-have, generate 1-2 interview questions:\n  - One behavioral (\"tell me about a time you…\")\n  - Optionally one situational (\"how would you approach…\")\n\nFor each question, also give me:\n  - What a strong answer looks like (3 bullets)\n  - What a weak answer looks like (2 bullets)\n  - Optional follow-up if the first answer is shallow\n\nCover collaboration + judgment + the specific technical skill — not just technical.\n\nAvoid:\n  - Questions about family, health, citizenship, religion\n  - Trick questions or \"gotchas\"\n  - Brain teasers unrelated to the job\n\nJD:\n  ---\n  [paste JD]\n  ---",
          },
        } satisfies ExampleCardContent,
      },
      {
        position: next(),
        number: "The strong/weak rubric",
        title: "Why this matters more than the questions",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "The questions themselves are 30% of consistent interviewing. The ",
              s("strong-answer / weak-answer rubric"),
              " is the other 70%. Without it, interviewers grade on \"how much I liked them.\" With it, you grade on the same thing across candidates.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: "Gotchas",
        title: "Questions that quietly filter for bias",
        type: SectionType.OBJECTIVES_BOX,
        content: {
          label: "Watch for these in Claude's output",
          items: [
            "**\"Culture fit\" questions** — usually proxies for similarity to current team; rewrite to \"working-style fit\"",
            "**\"Where do you see yourself in 5 years\"** — penalizes career-pivoters and parents",
            "**Whiteboard / coding tests for non-coding roles** — measures stress tolerance more than ability",
            "**Hypothetical client scenarios that require specific cultural knowledge** — disadvantages newcomers without revealing skill",
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
          title: "Build a question set — 15 minutes",
          intro: "Pick a JD you're actively interviewing for:",
          steps: [
            "Run the JD → question set + rubric prompt",
            "Scan for bias-prone phrasings",
            "Pick the 5 most discriminating (skill-revealing) questions",
            "Share with the interview panel + walk through the rubric",
            "Submit your final 5 questions",
          ],
        } satisfies TryItContent,
      },
    ],
    quizzes: () => [
      {
        position: 1,
        question:
          "Why also generate a strong-answer / weak-answer rubric?",
        options: [
          "Looks thorough",
          "Without it, different interviewers grade the same answer differently — the rubric is what makes the bar consistent across candidates",
          "Required by labor law",
          "Saves time during debriefs",
        ],
        correctIndex: 1,
        feedback:
          "The rubric is the actual quality control. The questions reveal information; the rubric makes the information comparable across candidates and across interviewers.",
      },
      {
        position: 2,
        question:
          "Claude included \"Tell me about your family situation\". What do you do?",
        options: [
          "Keep it — sounds friendly",
          "Strike it; family questions filter for parental status and are off-limits in most jurisdictions",
          "Move it to the end of the interview",
          "Reword as \"tell me about your support system\"",
        ],
        correctIndex: 1,
        feedback:
          "Family/health/age/religion questions get you nothing about ability and a lot about legal risk. Strike, don't reword.",
      },
    ],
    exercise: {
      title: "Interview question set — Submission",
      instructions: {
        steps: [
          "Pick a JD currently in the interview stage",
          "Generate question set + rubric with Claude",
          "Strike any bias-prone questions",
          "Submit: your final 5 questions + their strong/weak rubrics",
        ],
      },
    },
  };
}

// ============================================================
// MODULE 03 — Performance Review Drafts
// ============================================================
function hr03(): ModuleSpec {
  const next = makeCounter();
  return {
    position: 3,
    number: "03",
    title: "Performance Review Drafts.",
    subtitle: "Structure manager feedback into a review the employee will actually engage with.",
    heroSubtitle:
      "Most managers know what they want to say. They just don't have time to structure it. Claude takes scattered manager notes and produces a draft narrative they can edit, not write from scratch.",
    level: ModuleLevel.INTERMEDIATE,
    durationMinutes: 20,
    audienceLabel: AUDIENCE,
    availableFrom: OPEN_FROM,
    learningObjectives: [
      "Turn manager bullet-point notes into a balanced narrative",
      "Make praise specific and feedback actionable",
      "Catch language that's defensive, hedging, or evaluative-without-evidence",
      "Keep employee voice considered without inventing it",
    ],
    sections: () => [
      {
        position: next(),
        number: "When to use this",
        title: "Help managers draft, don't replace them",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Performance reviews are slow because writing structured feedback is hard. Claude turns bullets into paragraphs and surfaces missing evidence. The manager still owns the assessment.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: "The prompt",
        title: "Notes → balanced review draft",
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "Copy this prompt",
          intro: "Have the manager dump notes; structure with the prompt:",
          promptBlock: {
            body: "Below are a manager's notes for [employee role] for [review period]. Draft a balanced performance review with these sections:\n\n  ## Highlights\n  Specific accomplishments. Each must reference an actual project/outcome (use [project] placeholders if I haven't given specifics).\n\n  ## Growth areas\n  Things that need development. Each must have:\n    - The specific behavior or pattern\n    - The impact it had\n    - A concrete suggestion for next quarter\n\n  ## What I'd love to see next period\n  3 forward-looking priorities, written as commitments not vague goals.\n\nRules:\n  - Never invent projects, outcomes, or numbers — if I didn't give it, use [placeholder]\n  - No hedging openers (\"It's worth noting…\")\n  - Pair every critique with a path forward\n  - Tone: warm, direct, candid — not corporate-HR-speak\n\nManager notes:\n  ---\n  [paste notes]\n  ---",
          },
        } satisfies ExampleCardContent,
      },
      {
        position: next(),
        number: "Calibration",
        title: "The 'is this fair' pass",
        type: SectionType.OBJECTIVES_BOX,
        content: {
          intro: "Before sharing the draft with the manager, run this pass:",
          label: "Calibration checklist",
          items: [
            "**Evidence behind each claim** — did the manager actually cite the project, or is Claude filling in?",
            "**Tone parity** — would this same tone be used for a different employee in a similar situation?",
            "**Recency bias** — are 80% of the examples from the last 2 weeks?",
            "**Pattern vs. one-off** — \"sometimes misses deadlines\" needs more than one instance",
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
          title: "Never let Claude invent specifics.",
          body: "If the manager's notes don't include the example, Claude must not fabricate one. Use [project], [client], [outcome] placeholders for the manager to fill in. Inventing examples is worse than a thin review.",
        } satisfies CalloutContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.TRY_IT,
        content: {
          tag: "Try it",
          title: "Draft one real review — 20 minutes",
          intro: "Pick a current review you're supporting:",
          steps: [
            "Get manager bullet-point notes (15 min collection)",
            "Run the review-draft prompt",
            "Run the calibration checklist",
            "Send draft to manager for final edits",
            "Note time saved vs. their usual review prep",
          ],
        } satisfies TryItContent,
      },
    ],
    quizzes: () => [
      {
        position: 1,
        question:
          "Claude's draft says \"Maria led the Q1 launch successfully\". The manager's notes don't mention a launch. Right move?",
        options: [
          "Keep it — sounds positive",
          "Strike it; if there was no launch in the notes, Claude invented it; replace with a real example or remove",
          "Ask Claude where it got that",
          "Keep but soften to \"contributed to a launch\"",
        ],
        correctIndex: 1,
        feedback:
          "Invented positives are still inventions, and they create real problems when the employee or another manager pushes back. \"Show me the launch\" → there isn't one → trust is gone.",
      },
      {
        position: 2,
        question:
          "Why pair every critique with \"a path forward\"?",
        options: [
          "Sounds nicer",
          "Critiques without paths forward are demotivating and don't change behavior — turning each into a concrete next-quarter ask makes the review useful",
          "Required by labor law",
          "Easier for Claude to write",
        ],
        correctIndex: 1,
        feedback:
          "Performance reviews exist to drive better next-quarter performance. Critique without direction just creates defensiveness.",
      },
    ],
    exercise: {
      title: "Performance review draft — Submission",
      instructions: {
        steps: [
          "Pick a real review you're supporting",
          "Get manager notes",
          "Draft + calibrate with Claude",
          "Submit: the draft + 1 sentence on what the calibration pass caught",
        ],
      },
    },
  };
}

// ============================================================
// MODULE 04 — Onboarding Email Sequences
// ============================================================
function hr04(): ModuleSpec {
  const next = makeCounter();
  return {
    position: 4,
    number: "04",
    title: "Onboarding Email Sequences.",
    subtitle: "First-day, first-week, 30/60/90 — set up once, used forever.",
    heroSubtitle:
      "Good onboarding makes a new hire feel oriented; bad onboarding makes them feel lost. Once you write the sequence well, every new hire benefits — no repeated work.",
    level: ModuleLevel.FOUNDATION,
    durationMinutes: 15,
    audienceLabel: AUDIENCE,
    availableFrom: OPEN_FROM,
    learningObjectives: [
      "Draft a 5-email onboarding sequence (Day 0 → Day 90)",
      "Personalize sequences by role family without rewriting from scratch",
      "Keep the tone warm and human, not corporate-template",
      "Set up a template you actually save and reuse",
    ],
    sections: () => [
      {
        position: next(),
        number: "When to use this",
        title: "Sequence once, send forever",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Every new hire deserves a thoughtful first 90 days. The work isn't writing each email — it's writing the ",
              s("template"),
              " once, well, and personalizing on send. Claude does both halves with the right prompts.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: "The prompt",
        title: "Build the sequence",
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "Copy this prompt",
          intro: "Sequence + tone anchor + first-week specifics:",
          promptBlock: {
            body: "Draft a 5-email onboarding sequence for a [role family — e.g. \"new account manager at M2.0 Communications\"]:\n\n  1. Day 0 (pre-arrival, sent 2 days before start) — what to expect, what to bring, who they'll meet\n  2. Day 1 (afternoon of first day) — warm welcome, recap of key intros, what's on Day 2-5\n  3. Week 2 — the \"how's it going so far?\" check-in\n  4. Day 30 — the \"what feels right, what's confusing?\" check-in with 3 open questions\n  5. Day 90 — feedback both ways, settling-in milestone, intro to performance cadence\n\nTone anchor:\n  ---\n  [paste a good email you've already sent — your tone]\n  ---\n\nRules:\n  - Use [Name], [Manager], [Team Lead], [Office location] placeholders\n  - Avoid corporate-template language (\"We're thrilled to have you onboard!\")\n  - Keep each email under 150 words\n  - End each one with a single, specific next action",
          },
        } satisfies ExampleCardContent,
      },
      {
        position: next(),
        number: "Save it",
        title: "Make it a template you reuse",
        type: SectionType.OBJECTIVES_BOX,
        content: {
          label: "Once you have the sequence",
          items: [
            "**Save the master sequence** in a doc you can copy from",
            "**Per-role variants** — keep one for Finance, one for HR, one for M2 client-facing roles, etc.",
            "**Personalization layer** — name, role, manager, office location — fill in on send",
            "**Calendar reminders** — schedule Day 1, Day 30, Day 90 sends per hire",
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
          title: "Skip the corporate template language.",
          body: "\"We're thrilled to welcome you to the Seven Generation family\" is what people delete. \"You'll meet Maria tomorrow at 10 — she'll show you around\" is what people read. Specific beats enthusiastic.",
        } satisfies CalloutContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.TRY_IT,
        content: {
          tag: "Try it",
          title: "Build a sequence — 15 minutes",
          intro: "Pick a role family you're about to hire for:",
          steps: [
            "Pick a tone anchor (a real email you've sent)",
            "Run the sequence prompt",
            "Review each email — strip any corporate-template phrases",
            "Save as a template",
            "Use it on your next new hire",
          ],
        } satisfies TryItContent,
      },
    ],
    quizzes: () => [
      {
        position: 1,
        question:
          "Best way to make sequences warm and personal without writing each one from scratch?",
        options: [
          "Use lots of exclamation points",
          "Build a per-role template with placeholders + tone anchor; personalize on send",
          "Have each manager write their own",
          "Use a corporate HR template",
        ],
        correctIndex: 1,
        feedback:
          "Tone anchor + placeholders + per-role variants = warm at scale. Manager-written = inconsistent. Generic template = forgettable.",
      },
      {
        position: 2,
        question:
          "Day 30 email purpose?",
        options: [
          "Welcome them again",
          "Genuine check-in — 3 open questions, listen, then act on whatever they share",
          "Performance review",
          "Skip — too early",
        ],
        correctIndex: 1,
        feedback:
          "Day 30 is the \"caught my breath\" moment. It's the highest-leverage check-in of the whole sequence — if something's wrong, it surfaces here.",
      },
    ],
    exercise: {
      title: "Onboarding sequence — Submission",
      instructions: {
        steps: [
          "Pick a role family you'll hire for soon",
          "Build the sequence + save as template",
          "Send it (placeholders filled in) on the next new hire",
          "Submit: the master sequence + 1 sentence on what the Day 30 check-in revealed",
        ],
      },
    },
  };
}

// ============================================================
// MODULE 05 — Policy Q&A Translator
// ============================================================
function hr05(): ModuleSpec {
  const next = makeCounter();
  return {
    position: 5,
    number: "05",
    title: "Policy Q&A Translator.",
    subtitle: "Turn handbook clauses into plain-language answers to real questions.",
    heroSubtitle:
      "The handbook has the rule. The employee asking has a specific situation. Claude bridges the two — without inventing rules that aren't there.",
    level: ModuleLevel.INTERMEDIATE,
    durationMinutes: 15,
    audienceLabel: AUDIENCE,
    availableFrom: OPEN_FROM,
    learningObjectives: [
      "Answer specific policy questions citing the handbook clause",
      "Spot when the policy doesn't actually cover the question",
      "Avoid inventing policy that doesn't exist",
      "Hand off edge cases to legal/leadership cleanly",
    ],
    sections: () => [
      {
        position: next(),
        number: "When to use this",
        title: "Q&A, not policy interpretation",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Someone asks: \"Can I work from home Friday because my plumber is coming?\" The policy has rules about WFH. Claude reads the rules and gives the answer — with the exact clause cited. ",
              s("It doesn't invent flexibility that isn't there"),
              ", and it doesn't deny flexibility that is.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: "The prompt",
        title: "Policy + question → cited answer",
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "Copy this prompt",
          intro: "Paste the relevant policy excerpts + the question:",
          promptBlock: {
            body: "Below is the relevant section(s) of the Seven Generation employee handbook. Use ONLY what's written there — do not infer rules that aren't stated, and don't fill gaps with industry norms.\n\nPolicy excerpts:\n  ---\n  [paste relevant policy sections]\n  ---\n\nEmployee question:\n  [paste the question]\n\nAnswer in 3 parts:\n  1. The direct answer (1-2 sentences)\n  2. The policy basis — quote the specific clause and section number\n  3. What's NOT covered by the policy — if any part of the question goes beyond what the handbook says, flag it for follow-up\n\nTone: helpful, clear, not robotic. Treat the employee as a colleague, not a case.",
          },
        } satisfies ExampleCardContent,
      },
      {
        position: next(),
        number: "Safety",
        title: "Never invent policy",
        type: SectionType.CALLOUT,
        content: {
          variant: "warn",
          title: "If the handbook doesn't say it, neither does Claude.",
          body: "An invented policy answer creates inconsistent enforcement across employees — and a real legal problem when it surfaces. The right answer to \"the policy doesn't cover this\" is \"the policy doesn't cover this — let me check with leadership.\"",
        } satisfies CalloutContent,
      },
      {
        position: next(),
        number: "Edge cases",
        title: "When to hand off",
        type: SectionType.OBJECTIVES_BOX,
        content: {
          label: "Don't answer from Claude alone when…",
          items: [
            "**The policy is silent** — escalate to leadership or legal",
            "**The policy and a manager's prior decision conflict** — get alignment first",
            "**The question implies a sensitive issue** (discrimination, harassment, health) — handle directly, not via templated reply",
            "**The question implies regulatory grey area** — loop in legal counsel",
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
          title: "Answer one real question — 10 minutes",
          intro: "Pick a recent policy question from your queue:",
          steps: [
            "Pull the relevant handbook section(s)",
            "Run the policy + question prompt",
            "Verify Claude's quoted clause against the actual handbook",
            "Send the response (or escalate if Claude flagged it)",
            "Compare time vs. drafting from scratch",
          ],
        } satisfies TryItContent,
      },
    ],
    quizzes: () => [
      {
        position: 1,
        question:
          "Employee asks about pet bereavement leave. Your handbook is silent on it. Best move?",
        options: [
          "Have Claude infer based on \"general bereavement spirit\"",
          "Respond: \"The handbook doesn't cover this. Let me check with leadership and get back to you by [date].\"",
          "Say no",
          "Say yes",
        ],
        correctIndex: 1,
        feedback:
          "Silence in the handbook = escalate, don't improvise. Inventing policy creates inconsistency that comes back later.",
      },
      {
        position: 2,
        question:
          "Why ask Claude to QUOTE the clause, not paraphrase it?",
        options: [
          "Looks more thorough",
          "Quoted clause + section number = verifiable; paraphrased = potentially wrong; the employee can also check for themselves",
          "Required by law",
          "Easier to copy-paste",
        ],
        correctIndex: 1,
        feedback:
          "Quoting binds Claude to the actual policy. Paraphrasing is where invented rules sneak in.",
      },
    ],
    exercise: {
      title: "Policy Q&A — Submission",
      instructions: {
        steps: [
          "Pick a real policy question from your queue",
          "Pull the handbook sections + run the prompt",
          "Verify the quoted clause against the actual handbook",
          "Submit: the question, the response, and any escalation note",
        ],
      },
    },
  };
}

// ============================================================
// MODULE 06 — Engagement Survey Synthesis
// ============================================================
function hr06(): ModuleSpec {
  const next = makeCounter();
  return {
    position: 6,
    number: "06",
    title: "Engagement Survey Synthesis.",
    subtitle: "Find themes across hundreds of open-ended responses.",
    heroSubtitle:
      "Survey results sitting in a spreadsheet help no one. Claude reads all 200 open-ended responses and finds the patterns — the things multiple people raised that you'd otherwise miss.",
    level: ModuleLevel.INTERMEDIATE,
    durationMinutes: 20,
    audienceLabel: AUDIENCE,
    availableFrom: OPEN_FROM,
    learningObjectives: [
      "Extract themes from open-ended survey responses",
      "Quantify how many respondents raised each theme",
      "Preserve specific quotes that bring themes to life",
      "Anonymize before sharing themes with leadership",
    ],
    sections: () => [
      {
        position: next(),
        number: "When to use this",
        title: "Pattern-finding at survey scale",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Hundreds of open-ended comments are unscannable. Claude finds the 5-8 themes that come up repeatedly, ",
              s("with rough counts"),
              ", and surfaces the most representative quotes. The judgment about what to act on is still yours.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: "Set it up",
        title: "Strip names BEFORE pasting",
        type: SectionType.OBJECTIVES_BOX,
        content: {
          label: "Anonymization sweep",
          items: [
            "**Strip names** — anyone mentioned by name in a comment",
            "**Strip manager names** — even \"my manager X\" can identify the commenter via context",
            "**Strip team-of-one identifiers** — \"I'm the only [role] in [office]\" identifies them too",
            "**Keep the comment numbers** so you can trace back if needed (privately)",
          ],
        } satisfies ObjectivesBoxContent,
      },
      {
        position: next(),
        number: "The prompt",
        title: "Themes + counts + representative quotes",
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "Copy this prompt",
          intro: "Paste the anonymized comments:",
          promptBlock: {
            body: "Below are the open-ended responses to this question on our engagement survey: \"What would make Seven Generation a better place to work?\"\n\nFind the 5-8 themes that come up most often. For each theme:\n  - 2-3 word name\n  - Rough count (e.g. \"~25 mentions\")\n  - 1-paragraph description in neutral language\n  - 2 representative quotes (anonymized) that illustrate the theme\n  - Sentiment (mostly negative / mixed / mostly constructive)\n\nDon't invent themes that aren't there. If a comment doesn't fit a theme, group it as \"Other (count)\".\n\nDon't quantify with false precision — \"~25\" not \"24.6%\".\n\nComments:\n  ---\n  [paste anonymized comments]\n  ---",
          },
        } satisfies ExampleCardContent,
      },
      {
        position: next(),
        number: "Gotchas",
        title: "What Claude tends to do badly",
        type: SectionType.OBJECTIVES_BOX,
        content: {
          label: "Sanity-check the output",
          items: [
            "**Over-clustering** — merging two genuinely different themes into one for tidiness",
            "**Under-clustering** — splitting one theme into three based on different word choices",
            "**Sympathetic phrasing** — softening genuinely critical comments into \"constructive feedback\"",
            "**Over-precision counts** — Claude estimates; rerun with different wording if a count seems off",
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
          title: "Synthesize a real survey set — 20 minutes",
          intro: "Pick a recent survey question with open responses:",
          steps: [
            "Run the anonymization sweep",
            "Run the themes + counts + quotes prompt",
            "Sanity-check the themes against your own read of 20-30 comments",
            "Note any cluster Claude missed or oversimplified",
            "Submit: the final themes + your sanity-check note",
          ],
        } satisfies TryItContent,
      },
    ],
    quizzes: () => [
      {
        position: 1,
        question:
          "Why anonymize BEFORE pasting into Claude, not after?",
        options: [
          "Saves tokens",
          "Anything pasted into Claude leaves your screen — anonymize first, no exceptions on identifying info",
          "Required by survey vendor",
          "Makes themes cleaner",
        ],
        correctIndex: 1,
        feedback:
          "Same rule as Module 03 of the original Playbook — redact first, paste second. Engagement-survey data is exactly the kind of sensitive content this protects.",
      },
      {
        position: 2,
        question:
          "Claude reports \"about 25 mentions\" of \"better PTO\". You scan 30 of the 200 comments and only see 1. What does this mean?",
        options: [
          "Claude is wrong; rerun with different wording, and read a wider sample yourself",
          "Trust Claude — it read all 200",
          "Trust your sample of 30",
          "Discard the theme",
        ],
        correctIndex: 0,
        feedback:
          "A big mismatch between Claude's count and your sample = warning sign. Verify by reading a wider sample and re-prompting. Trust comes from agreement between Claude and your own spot-checks.",
      },
    ],
    exercise: {
      title: "Survey synthesis — Submission",
      instructions: {
        steps: [
          "Pick a recent open-ended survey question",
          "Anonymize the responses",
          "Run the themes + counts + quotes prompt",
          "Spot-check against your own reading of 20-30 comments",
          "Submit: the final themes + 1 sentence on what your spot-check confirmed or contradicted",
        ],
      },
    },
  };
}

// ============================================================
// MODULE 07 — Compensation Conversations Prep
// ============================================================
function hr07(): ModuleSpec {
  const next = makeCounter();
  return {
    position: 7,
    number: "07",
    title: "Compensation Conversations.",
    subtitle: "Prepping for the talk — the framing, the script, the hard questions.",
    heroSubtitle:
      "Comp conversations are high-stakes and often emotional. Claude helps you prep — anticipating questions, rehearsing answers, finding the framing. The conversation itself is still yours.",
    level: ModuleLevel.ADVANCED,
    durationMinutes: 20,
    audienceLabel: AUDIENCE,
    availableFrom: OPEN_FROM,
    learningObjectives: [
      "Anticipate the 5 questions an employee will likely ask",
      "Prep candid, defensible answers without corporate hedge",
      "Find framing for difficult conversations (no raise, small raise, etc.)",
      "Know what NEVER to put in writing or share with Claude",
    ],
    sections: () => [
      {
        position: next(),
        number: "When to use this",
        title: "Prep work, not the conversation itself",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Claude helps you walk into the conversation prepared. Anticipate questions, rehearse responses, frame the message. ",
              s("The conversation itself is human work"),
              " — eye contact, listening, adjusting.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: "Set it up",
        title: "What to share — and what to never share",
        type: SectionType.OBJECTIVES_BOX,
        content: {
          label: "Safe to share with Claude",
          items: [
            "**The general scenario** (\"giving a 3% raise to a senior PR associate who expected 8%\")",
            "**Generic context** (industry mid-range, company budget environment)",
            "**Your specific worries** about the conversation",
          ],
        } satisfies ObjectivesBoxContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.OBJECTIVES_BOX,
        content: {
          label: "NEVER share with Claude",
          items: [
            "**Specific employee names**",
            "**Exact current and proposed salaries**",
            "**Comparison salaries of other employees**",
            "**Any health, family, or personal details from the employee's history**",
          ],
        } satisfies ObjectivesBoxContent,
      },
      {
        position: next(),
        number: "The prompt",
        title: "Scenario → prep package",
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "Copy this prompt",
          intro: "Generic scenario; never specific names or numbers:",
          promptBlock: {
            body: "I'm preparing for a difficult comp conversation. Generic scenario:\n  - [Role family — e.g. \"senior PR associate, ~6 years experience\"]\n  - [Generic context — e.g. \"strong performer, but raise is smaller than they likely expect because we're below budget\"]\n  - The raise is roughly [range — e.g. \"low-single-digit %\"]\n  - They likely expected [higher range]\n\nHelp me prep:\n  1. The 5 questions they're most likely to ask, ranked by likelihood\n  2. A candid, honest 2-sentence answer to each\n  3. The framing of the news — what to lead with, what to acknowledge\n  4. The 2 hardest questions and longer responses for each\n  5. What to do if they react with [anger / sadness / silence]\n\nRules:\n  - No corporate hedge (\"unfortunately\", \"due to budget constraints\")\n  - Be honest about what is and isn't in our control\n  - Don't promise anything you can't deliver",
          },
        } satisfies ExampleCardContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.CALLOUT,
        content: {
          variant: "warn",
          title: "Specifics stay out of Claude.",
          body: "Names, exact salaries, comparisons to specific other employees — none of this goes into Claude, no matter how anonymized you think you've made it. Use generic scenarios only.",
        } satisfies CalloutContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.TRY_IT,
        content: {
          tag: "Try it",
          title: "Prep one real conversation — 20 minutes",
          intro: "Pick a real conversation coming up:",
          steps: [
            "Abstract the scenario to generic terms (no names, no exact numbers)",
            "Run the scenario → prep package prompt",
            "Read the 5 likely questions; do they match your gut?",
            "Memorize the framing for the news",
            "Have the conversation",
          ],
        } satisfies TryItContent,
      },
    ],
    quizzes: () => [
      {
        position: 1,
        question:
          "Maria is getting a 2% raise; Jose got 8% last cycle. Both senior PR associates. Can you tell Claude this for prep?",
        options: [
          "Yes — useful context for framing",
          "No — never share specific employee comparisons, even anonymized; use generic ranges only",
          "Yes — but only Jose's raise",
          "Yes — but only with first names",
        ],
        correctIndex: 1,
        feedback:
          "Specific comparisons identify people via context. Generic scenarios (\"two senior associates, one received above range, one below\") capture the dynamic without the data.",
      },
      {
        position: 2,
        question:
          "Claude's draft for the lead-in says \"Unfortunately, due to budget constraints, we can only offer 3%.\" What's wrong?",
        options: [
          "Nothing — it's truthful",
          "It's corporate hedge — softens the message but reads insincere; the employee hears \"the company isn't choosing you\"; rewrite to lead with the honest framing",
          "Should be longer",
          "Should use \"however\" instead",
        ],
        correctIndex: 1,
        feedback:
          "\"Unfortunately/budget constraints\" is the most worn-out HR phrase. It reads as deflection. Honest direct framing — even when the news is bad — lands better.",
      },
    ],
    exercise: {
      title: "Comp conversation prep — Submission",
      instructions: {
        steps: [
          "Pick a real conversation coming up",
          "Abstract to a generic scenario",
          "Run the prep prompt",
          "Have the conversation",
          "Submit: the generic scenario + what actually came up vs. what you'd prepped for",
        ],
      },
    },
  };
}

// ============================================================
// MODULE 08 — Exit Interview Pattern-Finding
// ============================================================
function hr08(): ModuleSpec {
  const next = makeCounter();
  return {
    position: 8,
    number: "08",
    title: "Exit Interview Patterns.",
    subtitle: "Find the themes across last quarter's exits before they cost you another hire.",
    heroSubtitle:
      "Each exit interview is one data point. Twenty of them, read together, are a map of where the company is losing people — and why. Claude reads them all and draws the map.",
    level: ModuleLevel.ADVANCED,
    durationMinutes: 20,
    audienceLabel: AUDIENCE,
    availableFrom: OPEN_FROM,
    learningObjectives: [
      "Synthesize themes across a quarter's worth of exit interviews",
      "Separate role-specific issues from company-wide ones",
      "Quantify which themes are growing vs. shrinking",
      "Produce a 1-page leadership brief from 20+ raw interviews",
    ],
    sections: () => [
      {
        position: next(),
        number: "When to use this",
        title: "Patterns matter more than any single interview",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "One person leaving for one reason is a data point. ",
              s("Eight people leaving for variations of the same reason"),
              " is a problem you can fix. Claude finds that pattern faster than you can re-read 20 PDFs.",
            ),
          ],
        } satisfies TextContent,
      },
      {
        position: next(),
        number: "Set it up",
        title: "Anonymize aggressively",
        type: SectionType.OBJECTIVES_BOX,
        content: {
          label: "Exit interviews need extra care",
          items: [
            "**Strip names** — employee, manager, anyone mentioned",
            "**Strip team-of-one identifiers** — \"the only [role] in [office]\"",
            "**Keep tenure brackets** (\"<1 year\", \"1-3 years\", \"3-5 years\") instead of exact dates",
            "**Keep role family** (\"PR account team\") not specific role + level",
            "**Keep exit reason** but generalize specifics that identify the person",
          ],
        } satisfies ObjectivesBoxContent,
      },
      {
        position: next(),
        number: "The prompt",
        title: "Quarter synthesis",
        type: SectionType.EXAMPLE_CARD,
        content: {
          label: "Copy this prompt",
          intro: "Anonymized interview summaries; ask for the map:",
          promptBlock: {
            body: "Below are anonymized summaries of [N] exit interviews from [time period — e.g. \"Q1-Q2 2026\"]. Help me synthesize:\n\n  ## Top themes (5-8)\n  - 2-3 word theme name\n  - How many exits mentioned it\n  - Whether it's concentrated in a specific tenure bracket / role family / entity\n  - 2 representative anonymized quotes\n\n  ## Growing vs. shrinking\n  Compare to prior period if I provide it — flag what's increasing and what's no longer showing up.\n\n  ## What's NOT showing up\n  Things you might have expected to see but didn't.\n\n  ## Suggested 1-page leadership brief\n  3 paragraphs: pattern, evidence, suggested action. Action should be concrete (\"audit X process\") not vague (\"improve culture\").\n\nDon't fabricate quotes. If a quote isn't in the summaries, mark [synthesized] or skip.\n\nInterviews:\n  ---\n  [paste anonymized summaries]\n  ---",
          },
        } satisfies ExampleCardContent,
      },
      {
        position: next(),
        number: "Gotchas",
        title: "The honesty gradient",
        type: SectionType.TEXT,
        content: {
          paragraphs: [
            p(
              "Exit interviews vary in honesty. The ones with their next job already lined up are more candid; the ones still looking are more diplomatic. ",
              s("Claude can't tell the difference"),
              ". Read the most candid ones first and let those calibrate your interpretation of the rest.",
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
          title: "Don't share with leadership without your read.",
          body: "Claude's synthesis is a starting point. Read the underlying interviews yourself before any leadership conversation — you'll catch context Claude missed and avoid claims you can't back up if challenged.",
        } satisfies CalloutContent,
      },
      {
        position: next(),
        number: null,
        title: null,
        type: SectionType.TRY_IT,
        content: {
          tag: "Try it",
          title: "Synthesize last quarter's exits — 20 minutes",
          intro: "Pull last quarter's exit interviews:",
          steps: [
            "Run the aggressive anonymization sweep",
            "Run the synthesis prompt",
            "Read 3-4 underlying interviews to sanity-check the themes",
            "Refine the 1-page leadership brief in your voice",
            "Submit the brief",
          ],
        } satisfies TryItContent,
      },
    ],
    quizzes: () => [
      {
        position: 1,
        question:
          "Claude reports \"~6 exits cited 'lack of growth opportunities'\". You read 5 of the source interviews and only see this in 1. Right move?",
        options: [
          "Trust Claude — it read all 20",
          "Sample more of the underlying interviews; if the discrepancy holds, rerun the synthesis with different prompting or do it yourself",
          "Discard the theme",
          "Average the two counts",
        ],
        correctIndex: 1,
        feedback:
          "Big mismatch between Claude's count and your read = warning sign worth investigating. The pattern only matters if it's real.",
      },
      {
        position: 2,
        question:
          "Best leadership-brief action item?",
        options: [
          "\"Improve company culture\"",
          "\"Audit promotion-cycle communication in the PR account team within 60 days — 5 of 6 exits in that team cited unclear path forward\"",
          "\"Take exit feedback seriously\"",
          "\"Increase salaries\"",
        ],
        correctIndex: 1,
        feedback:
          "Concrete, scoped, with a deadline and the evidence inline. That's what leadership can act on. Vague action items get vague follow-through.",
      },
    ],
    exercise: {
      title: "Exit patterns — Submission",
      instructions: {
        steps: [
          "Pull last quarter's exit interviews",
          "Anonymize, then synthesize with Claude",
          "Sanity-check against your own read",
          "Submit: the 1-page leadership brief with concrete action items",
        ],
      },
    },
  };
}

// ============================================================
// Program export
// ============================================================

export const CLAUDE_HR_MODULES: ModuleSpec[] = [
  hr01(),
  hr02(),
  hr03(),
  hr04(),
  hr05(),
  hr06(),
  hr07(),
  hr08(),
];

export const CLAUDE_HR_PROGRAM: ProgramSpec = {
  slug: "claude-for-hr",
  title: "Claude for HR",
  subtitle:
    "Eight role-specific playbooks — JDs, interviews, reviews, onboarding, policy Q&A, surveys, comp conversations, exit patterns.",
  description:
    "Tailored to the HR team's day-to-day. Each module is one common HR task done well with Claude — with the prompts, the anonymization rules, and the safety lines.",
  startDate: OPEN_FROM,
  endDate: new Date("2026-06-30T23:59:59Z"),
  audienceRules: {
    departments: ["HR", "HR / L&D"],
    roles: ["EMPLOYEE", "ADMIN"],
  },
  modules: CLAUDE_HR_MODULES,
};
