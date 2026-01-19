import { Resend } from "resend";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || "PhotoMarket <noreply@photomarket.tech>";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react?: React.ReactElement;
  html?: string;
  text?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail({ to, subject, react, html, text }: SendEmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Email] RESEND_API_KEY not configured, skipping email");
    return { success: false, error: "Email not configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      react,
      html,
      text,
    });

    if (error) {
      console.error("[Email] Failed to send:", error);
      return { success: false, error: error.message };
    }

    console.log("[Email] Sent successfully:", data?.id);
    return { success: true, id: data?.id };
  } catch (error) {
    console.error("[Email] Error:", error);
    return { success: false, error: "Failed to send email" };
  }
}

// Email types for type-safe sending
export type EmailType = 
  | "booking-confirmation"
  | "booking-cancelled"
  | "booking-reminder"
  | "new-review"
  | "welcome";
