// Server-only: the email delivery boundary.
import { randomUUID } from "node:crypto";
import type { EmailMessage, EmailSendResult } from "@/lib/email/model";

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

export function getEmailProvider(): EmailProvider {
  if (!provider) provider = new ConsoleEmailProvider();
  return provider;
}
