/**
 * Submission lifecycle notifications.
 *
 * - notifySubmissionReceived: emails the learner's manager when they submit.
 * - notifySubmissionReviewed: emails the learner when their submission is
 *   approved or revision is requested.
 *
 * Senders are best-effort: failures don't block the user-facing action.
 */

import { db } from "@/lib/db";
import { sendEmail } from "./sender";
import type { SubmissionStatus } from "@prisma/client";

const appUrl = () =>
  process.env.NEXTAUTH_URL?.replace(/\/+$/, "") ?? "http://localhost:3000";

export async function notifySubmissionReceived(submissionId: string) {
  const submission = await db.submission.findUnique({
    where: { id: submissionId },
    include: {
      user: { include: { manager: { select: { email: true, name: true } } } },
      module: { include: { program: { select: { title: true } } } },
    },
  });
  if (!submission?.user.manager?.email) return;

  const learnerName = submission.user.name ?? submission.user.email;
  const managerName =
    submission.user.manager.name ?? submission.user.manager.email;
  const moduleLabel = `${submission.module.program.title} · Module ${submission.module.number}`;
  const reviewUrl = `${appUrl()}/reviews`;

  await sendEmail({
    to: submission.user.manager.email,
    subject: `${learnerName} submitted Module ${submission.module.number}`,
    html: editorialEmail({
      preheader: `${learnerName} needs your review on ${moduleLabel}.`,
      headline: "New submission to review.",
      body: [
        `${managerName.split(" ")[0]} —`,
        `${learnerName} just submitted their reflection for <strong>${moduleLabel}</strong>.`,
        `Take a look when you have a few minutes — approve it or send back a revision request with notes.`,
      ],
      cta: { label: "Open review queue", href: reviewUrl },
    }),
    text: [
      `${managerName.split(" ")[0]} —`,
      ``,
      `${learnerName} just submitted their reflection for ${moduleLabel}.`,
      ``,
      `Review it here: ${reviewUrl}`,
    ].join("\n"),
  });
}

export async function notifySubmissionReviewed(
  submissionId: string,
  decision: SubmissionStatus,
) {
  const submission = await db.submission.findUnique({
    where: { id: submissionId },
    include: {
      user: { select: { email: true, name: true } },
      module: {
        include: {
          program: { select: { title: true, slug: true } },
        },
      },
      reviewer: { select: { name: true, email: true } },
    },
  });
  if (!submission) return;
  if (decision === "PENDING") return;

  const learnerFirstName = (submission.user.name ?? submission.user.email).split(" ")[0];
  const reviewerName =
    submission.reviewer?.name ?? submission.reviewer?.email ?? "Your reviewer";
  const moduleUrl = `${appUrl()}/programs/${submission.module.program.slug}/modules/${submission.module.id}`;

  if (decision === "APPROVED") {
    await sendEmail({
      to: submission.user.email,
      subject: `Module ${submission.module.number} — approved`,
      html: editorialEmail({
        preheader: `${reviewerName} approved your submission.`,
        headline: "Approved.",
        body: [
          `Nice work, ${learnerFirstName}.`,
          `${reviewerName} approved your submission for <strong>${submission.module.program.title} · Module ${submission.module.number}</strong>.`,
          `That module is now checked off on your dashboard.`,
        ],
        cta: { label: "Back to the program", href: moduleUrl },
      }),
      text: [
        `Nice work, ${learnerFirstName}.`,
        ``,
        `${reviewerName} approved your submission for ${submission.module.program.title} · Module ${submission.module.number}.`,
        ``,
        `${moduleUrl}`,
      ].join("\n"),
    });
    return;
  }

  // REVISION_REQUESTED
  const notes = submission.reviewerNotes ?? "";
  await sendEmail({
    to: submission.user.email,
    subject: `Module ${submission.module.number} — revision requested`,
    html: editorialEmail({
      preheader: `${reviewerName} sent you a few notes.`,
      headline: "Revision requested.",
      body: [
        `Hi ${learnerFirstName},`,
        `${reviewerName} read your submission for <strong>${submission.module.program.title} · Module ${submission.module.number}</strong> and asked for a small revision.`,
        ...(notes
          ? [
              `<em style="color:#6B7280;">Reviewer notes:</em>`,
              `<blockquote style="margin:0;padding-left:16px;border-left:3px solid #B8943F;color:#2A3548;">${escapeHtml(notes)}</blockquote>`,
            ]
          : []),
        `Open the module to update your reflection.`,
      ],
      cta: { label: "Update submission", href: moduleUrl },
    }),
    text: [
      `Hi ${learnerFirstName},`,
      ``,
      `${reviewerName} read your submission for ${submission.module.program.title} · Module ${submission.module.number} and asked for a small revision.`,
      ``,
      notes ? `Reviewer notes:\n${notes}\n` : "",
      `Update it here: ${moduleUrl}`,
    ].join("\n"),
  });
}

/* ---------------- shared template helpers ---------------- */

function editorialEmail(args: {
  preheader: string;
  headline: string;
  body: string[];
  cta: { label: string; href: string };
}): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>${args.headline}</title>
  </head>
  <body style="margin:0;padding:0;background:#FAF6EF;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#1A2332;">
    <div style="display:none;max-height:0;overflow:hidden;color:transparent;">${args.preheader}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6EF;padding:48px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #E5DFD0;border-radius:4px;">
            <tr>
              <td style="padding:28px 40px;background:#1A2332;border-radius:4px 4px 0 0;">
                <div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.18em;color:#B8943F;text-transform:uppercase;">
                  Seven Generation &nbsp;/&nbsp; <span style="color:#FAF6EF;">Learning</span>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:40px;">
                <h1 style="margin:0 0 20px;font-family:Georgia,serif;font-weight:400;font-size:26px;color:#1A2332;">${args.headline}</h1>
                ${args.body
                  .map(
                    (p) =>
                      `<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#2A3548;">${p}</p>`,
                  )
                  .join("")}
                <p style="margin:24px 0 0;">
                  <a href="${args.cta.href}" style="display:inline-block;padding:12px 26px;background:#B8943F;color:#1A2332;text-decoration:none;font-weight:600;font-size:13px;letter-spacing:0.05em;text-transform:uppercase;border-radius:2px;">${args.cta.label}</a>
                </p>
              </td>
            </tr>
          </table>
          <p style="margin:20px 0 0;font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.1em;color:#6B7280;text-transform:uppercase;">
            Seven Generation Group
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
