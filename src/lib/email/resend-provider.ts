// Server-only: real email delivery via Resend's REST API. NO dependency — uses
// the built-in fetch, so it is build-safe whether or not Resend is configured.
// Implements the existing EmailProvider interface; selected by getEmailProvider()
// only when RESEND_API_KEY + EMAIL_FROM are set. Templates/callers unchanged.
import type { EmailProvider } from "@/lib/email/email-provider";
import type { EmailMessage, EmailSendResult } from "@/lib/email/model";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export class ResendEmailProvider implements EmailProvider {
  readonly name = "resend";

  async send(message: EmailMessage): Promise<EmailSendResult> {
    const key = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;
    // Internal notifications (no explicit recipient) route to EMAIL_INTERNAL.
    const to = message.to ?? process.env.EMAIL_INTERNAL;

    if (!key || !from) {
      return { ok: false, provider: this.name, delivered: false, error: "Resend not configured." };
    }
    if (!to) {
      return {
        ok: true,
        provider: this.name,
        delivered: false,
        error: "No recipient (set EMAIL_INTERNAL for internal notifications).",
      };
    }

    try {
      const res = await fetch(RESEND_ENDPOINT, {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to, subject: message.subject, text: message.text }),
      });

      if (!res.ok) {
        return { ok: false, provider: this.name, delivered: false, error: `Resend responded ${res.status}` };
      }
      const data = (await res.json().catch(() => ({}))) as { id?: string };
      return { ok: true, id: data.id, provider: this.name, delivered: true };
    } catch {
      return { ok: false, provider: this.name, delivered: false, error: "Resend request failed." };
    }
  }
}
