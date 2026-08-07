import { Resend } from "resend";

interface SendMailInput {
  subject: string;
  text: string;
  replyTo?: string;
}

/** Returns false (never throws) when Resend isn't configured or the send fails. */
export async function sendMail({ subject, text, replyTo }: SendMailInput): Promise<boolean> {
  const apiKey = import.meta.env.RESEND_API_KEY;
  const to = import.meta.env.CONTACT_EMAIL;
  const from = import.meta.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !to || !from) {
    console.error("Resend not configured (RESEND_API_KEY / CONTACT_EMAIL / CONTACT_FROM_EMAIL) — mail not sent");
    return false;
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({ from, to, subject, text, replyTo });
    if (error) {
      console.error("Resend send failed", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Resend send threw", error);
    return false;
  }
}
