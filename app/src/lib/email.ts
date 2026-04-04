import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM_ADDRESS =
  process.env.RESEND_FROM_EMAIL || "PRAGMA <noreply@pragma.app>";

export type EmailType =
  | "welcome"
  | "match_mutual"
  | "new_message"
  | "profile_reminder"
  | "inactivity_warning";

interface SendEmailOptions {
  to: string;
  subject: string;
  react: React.ReactElement;
  tags?: { name: string; value: string }[];
}

export async function sendEmail({ to, subject, react, tags }: SendEmailOptions) {
  const resend = getResend();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — skipping email to", to);
    return { success: false, error: "No API key" };
  }

  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject,
    react,
    tags,
  });

  if (error) {
    console.error("[email] Send failed:", error);
    return { success: false, error: error.message };
  }

  return { success: true, id: data?.id };
}
