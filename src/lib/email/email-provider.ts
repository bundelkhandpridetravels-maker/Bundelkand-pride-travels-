// Server-only: the email delivery boundary.
import { randomUUID } from "node:crypto";
import type { EmailMessage, EmailSendResult } from "@/lib/email/model";
import { ResendEmailProvider } from "@/lib/email/resend-provider";

/**
 * Email delivery boundary. Workflow orchestrators depend on this interface,
 * never a concrete provider. Console stub logs and reports `delivered:false`;
 * swap in ResendEmailProvider here — set the API key and implement `send()` —
 * with no change to templates or callers.
 */
export interface EmailProvider {
  readonly name: string;
  send(message: EmailMessage): Promise<EmailSendResult>;
}

class ConsoleEmailProvider implements EmailProvider {
  readonly name = "console";
  async send(message: EmailMessage): Promise<EmailSendResult> {
    // Structured log so nothing is lost pre-Resend. Not delivered by design.
    console.info(
      "[email:queued]",
      JSON.stringify({ template: message.template, to: message.to ?? null, subject: message.subject }),
    );
    return { ok: true, id: `eml_${randomUUID()}`, provider: this.name, delivered: false };
  }
}

let provider: EmailProvider | null = null;

/**
 * Selects the real provider when configured, else the console stub. Same public
 * contract — callers and templates are untouched. Set RESEND_API_KEY + EMAIL_FROM
 * to go live; no code change, no redeploy of logic required.
 */
export function getEmailProvider(): EmailProvider {
  if (provider) return provider;
  provider =
    process.env.RESEND_API_KEY && process.env.EMAIL_FROM
      ? new ResendEmailProvider()
      : new ConsoleEmailProvider();
  return provider;
}
