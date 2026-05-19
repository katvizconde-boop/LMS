/**
 * Generic transactional email sender.
 *
 * If RESEND_API_KEY is unset, logs to console (dev mode).
 * Otherwise POSTs to Resend's HTTPS API.
 *
 * All callers should treat failures as non-fatal — wrap with .catch(...).
 */

type SendArgs = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
};

export async function sendEmail({ to, subject, html, text }: SendArgs): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  // Use || not ?? — empty-string env var should fall through to the default.
  const from = process.env.EMAIL_FROM || "onboarding@resend.dev";

  if (!apiKey) {
    const banner = "-".repeat(72);
    console.log(
      `\n${banner}\n📧 [DEV] EMAIL (RESEND_API_KEY unset)\n   to:      ${
        Array.isArray(to) ? to.join(", ") : to
      }\n   subject: ${subject}\n   ${text.split("\n").join("\n   ")}\n${banner}\n`,
    );
    return;
  }

  let res: Response;
  try {
    res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html, text }),
    });
  } catch (e) {
    console.error(
      "[email/sender] fetch to Resend threw:",
      e instanceof Error ? e.message : e,
    );
    throw e;
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(
      `[email/sender] Resend ${res.status} ${res.statusText} — from=${from} to=${
        Array.isArray(to) ? to.join(",") : to
      } body=${body}`,
    );
    throw new Error(`Resend send failed (${res.status}): ${body}`);
  }
}
