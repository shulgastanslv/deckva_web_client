import { Resend } from "resend";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string): boolean {
  const email = normalizeEmail(value);
  return email.length <= 254 && EMAIL_RE.test(email);
}

export function appBaseUrl(): string {
  return (process.env.NEXTAUTH_URL ).replace(/\/$/, "");
}

export type SendResult =
  | { ok: true }
  | { ok: false; reason: "unconfigured" | "failed" };

function resendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export async function sendAuthEmail(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<SendResult> {
  const from =
    process.env.RESEND_FROM?.trim() || "Deckva <onboarding@resend.dev>";
  const resend = resendClient();

  if (!resend) {
    return { ok: false, reason: "unconfigured" };
  }

  try {
    const { error } = await resend.emails.send({
      from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });

    if (error) {
      console.error("sendAuthEmail:", error);
      return { ok: false, reason: "failed" };
    }

    return { ok: true };
  } catch (err) {
    console.error("sendAuthEmail:", err);
    return { ok: false, reason: "failed" };
  }
}

/** Simple transactional email layout for verify / reset. */
export function authEmailHtml(input: {
  title: string;
  body: string;
  actionLabel: string;
  url: string;
}): string {
  const safeUrl = input.url.replace(/"/g, "&quot;");
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px;background:#ffffff;border-radius:16px;padding:32px 28px;">
          <tr>
            <td style="font-size:20px;font-weight:600;color:#18181b;padding-bottom:8px;">
              Deckva
            </td>
          </tr>
          <tr>
            <td style="font-size:18px;font-weight:600;color:#18181b;padding-bottom:12px;">
              ${input.title}
            </td>
          </tr>
          <tr>
            <td style="font-size:15px;line-height:1.55;color:#52525b;padding-bottom:24px;">
              ${input.body}
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:24px;">
              <a href="${safeUrl}"
                 style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 20px;border-radius:8px;">
                ${input.actionLabel}
              </a>
            </td>
          </tr>
          <tr>
            <td style="font-size:12px;line-height:1.5;color:#a1a1aa;">
              If the button doesn’t work, paste this link into your browser:<br />
              <a href="${safeUrl}" style="color:#71717a;word-break:break-all;">${input.url}</a>
            </td>
          </tr>
          <tr>
            <td style="font-size:12px;line-height:1.5;color:#a1a1aa;padding-top:20px;border-top:1px solid #f4f4f5;">
              If you didn’t ask for this, you can ignore this email.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
