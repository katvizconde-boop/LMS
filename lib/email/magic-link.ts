/**
 * Magic-link email template + sender.
 * If RESEND_API_KEY is unset, we log the link to console (dev mode).
 * Otherwise we POST to Resend's HTTPS API directly (no SDK required).
 */

type SendArgs = {
  to: string;
  url: string;
};

export async function sendMagicLink({ to, url }: SendArgs): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    const banner = "=".repeat(72);
    console.log(
      `\n${banner}\n🪄  MAGIC LINK  (dev mode — RESEND_API_KEY not set)\n    to:  ${to}\n    url: ${url}\n${banner}\n`,
    );
    return;
  }

  const from = process.env.EMAIL_FROM ?? "onboarding@resend.dev";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: "Your Seven Generation Learning sign-in link",
      html: renderHtml(url),
      text: renderText(url),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend send failed (${res.status}): ${body}`);
  }
}

function renderHtml(url: string): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>Sign in to Seven Generation Learning</title>
  </head>
  <body style="margin:0;padding:0;background:#FAF6EF;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#1A2332;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6EF;padding:48px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #E5DFD0;border-radius:4px;">
            <tr>
              <td style="padding:36px 40px;background:#1A2332;border-radius:4px 4px 0 0;">
                <div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.18em;color:#B8943F;text-transform:uppercase;">
                  Seven Generation &nbsp;/&nbsp; <span style="color:#FAF6EF;">Learning</span>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:48px 40px 32px;">
                <h1 style="margin:0 0 16px;font-family:'Georgia',serif;font-weight:400;font-size:28px;color:#1A2332;">Welcome back.</h1>
                <p style="margin:0 0 28px;font-size:16px;line-height:1.6;color:#2A3548;">Click the button below to sign in. The link is good for 24 hours and only works once.</p>
                <p style="margin:0 0 32px;">
                  <a href="${url}" style="display:inline-block;padding:14px 32px;background:#B8943F;color:#1A2332;text-decoration:none;font-weight:600;font-size:14px;letter-spacing:0.05em;text-transform:uppercase;border-radius:2px;">Sign in</a>
                </p>
                <p style="margin:0 0 8px;font-size:13px;color:#6B7280;">If the button doesn't work, paste this link into your browser:</p>
                <p style="margin:0;font-family:'Courier New',monospace;font-size:12px;color:#6B7280;word-break:break-all;">${url}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px 32px;border-top:1px solid #E5DFD0;">
                <p style="margin:0;font-size:12px;color:#6B7280;line-height:1.6;">
                  Didn't request this? You can safely ignore this email — no one can sign in without the link.
                </p>
              </td>
            </tr>
          </table>
          <p style="margin:24px 0 0;font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.1em;color:#6B7280;text-transform:uppercase;">
            Seven Generation Group
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function renderText(url: string): string {
  return [
    "Sign in to Seven Generation Learning",
    "",
    "Click this link to sign in (good for 24 hours, one use only):",
    url,
    "",
    "Didn't request this? You can safely ignore this email.",
  ].join("\n");
}
