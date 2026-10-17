import nodemailer, { Transporter } from "nodemailer";
import { logger } from "../config/logger";
import { AppError } from "../shared/utils/AppError";

type MailLang = "en" | "he";

const isProduction = (): boolean => process.env.NODE_ENV === "production";

export function isEmailConfigured(): boolean {
  if (process.env.RESEND_API_KEY?.trim()) {
    return true;
  }
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim()
  );
}

export function assertEmailReadyForProduction(): void {
  if (isProduction() && !isEmailConfigured()) {
    throw new AppError(
      "Email delivery is not configured. Set RESEND_API_KEY or SMTP_HOST, SMTP_USER, and SMTP_PASS.",
      503
    );
  }
}

export function generateVerificationCode(): {
  code: string;
  expires: Date;
} {
  return {
    code: Math.floor(100000 + Math.random() * 900000).toString(),
    expires: new Date(Date.now() + 15 * 60 * 1000),
  };
}

function frontendBaseUrl(): string {
  return (process.env.FRONTEND_URL || "http://localhost:5173").replace(
    /\/$/,
    ""
  );
}

function fromAddress(): string {
  return (
    process.env.EMAIL_FROM?.trim() ||
    (process.env.SMTP_USER?.trim()
      ? `KindLoop <${process.env.SMTP_USER.trim()}>`
      : "KindLoop <noreply@kindloop.local>")
  );
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[char] || char;
  });
}

let smtpTransporter: Transporter | null = null;

function getSmtpTransporter(): Transporter {
  if (!smtpTransporter) {
    const port = Number(process.env.SMTP_PORT || 587);
    smtpTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: process.env.SMTP_SECURE === "true" || port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return smtpTransporter;
}

async function sendViaResend(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<void> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY!.trim()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress(),
      to: [to],
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend failed (${response.status}): ${body}`);
  }
}

async function deliverEmail(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<void> {
  if (process.env.RESEND_API_KEY?.trim()) {
    await sendViaResend(to, subject, html, text);
    logger.info(`Email sent via Resend to ${to}: ${subject}`);
    return;
  }

  if (
    process.env.SMTP_HOST?.trim() &&
    process.env.SMTP_USER?.trim() &&
    process.env.SMTP_PASS?.trim()
  ) {
    await getSmtpTransporter().sendMail({
      from: fromAddress(),
      to,
      subject,
      html,
      text,
    });
    logger.info(`Email sent via SMTP to ${to}: ${subject}`);
    return;
  }

  if (isProduction()) {
    throw new AppError("Email delivery is not configured.", 503);
  }

  logger.warn(`[dev email — not delivered] To: ${to} | ${subject}\n${text}`);
}

function brandedHtml(title: string, body: string, dir: "ltr" | "rtl"): string {
  return `<!DOCTYPE html>
<html lang="${dir === "rtl" ? "he" : "en"}" dir="${dir}">
  <body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
            <tr>
              <td style="background:linear-gradient(135deg,#359364,#24754f);padding:20px 28px;color:#ffffff;font-size:20px;font-weight:bold;">
                KindLoop
              </td>
            </tr>
            <tr>
              <td style="padding:28px;color:#0f172a;font-size:16px;line-height:1.6;" dir="${dir}">
                <h1 style="margin:0 0 16px;font-size:22px;">${title}</h1>
                ${body}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendVerificationCodeEmail(params: {
  to: string;
  code: string;
  firstName: string;
  language?: MailLang;
}): Promise<void> {
  const { to, code, firstName, language = "en" } = params;
  const name = escapeHtml(firstName || "");
  const isHe = language === "he";
  const subject = isHe
    ? `${code} הוא קוד האימות שלך ב-KindLoop`
    : `Your KindLoop verification code is ${code}`;
  const title = isHe ? "אמת את כתובת האימייל" : "Verify your email";
  const greeting = isHe ? `שלום ${name},` : `Hi ${name},`;
  const intro = isHe
    ? "השתמש בקוד בן 6 הספרות כדי לאמת את החשבון. הקוד בתוקף ל-15 דקות."
    : "Use this 6-digit code to verify your account. It expires in 15 minutes.";
  const ignore = isHe
    ? "אם לא נרשמת ל-KindLoop, אפשר להתעלם מהמייל הזה."
    : "If you did not create a KindLoop account, you can ignore this email.";

  const html = brandedHtml(
    title,
    `<p>${greeting}</p>
     <p>${intro}</p>
     <p style="font-size:32px;letter-spacing:8px;font-weight:bold;color:#24754f;margin:24px 0;text-align:center;">${escapeHtml(
       code
     )}</p>
     <p style="color:#64748b;font-size:14px;">${ignore}</p>`,
    isHe ? "rtl" : "ltr"
  );
  const text = `${greeting}\n\n${intro}\n\n${code}\n\n${ignore}`;

  try {
    await deliverEmail(to, subject, html, text);
  } catch (error) {
    logger.error("Failed to send verification email:", error);
    throw new AppError(
      "Could not send verification email. Please try resending the code.",
      502
    );
  }
}

export async function sendPasswordResetEmail(params: {
  to: string;
  token: string;
  firstName: string;
  language?: MailLang;
}): Promise<void> {
  const { to, token, firstName, language = "en" } = params;
  const name = escapeHtml(firstName || "");
  const resetUrl = `${frontendBaseUrl()}/reset-password/${encodeURIComponent(
    token
  )}`;
  const isHe = language === "he";
  const subject = isHe
    ? "איפוס סיסמה ב-KindLoop"
    : "Reset your KindLoop password";
  const title = isHe ? "איפוס סיסמה" : "Reset your password";
  const greeting = isHe ? `שלום ${name},` : `Hi ${name},`;
  const intro = isHe
    ? "קיבלנו בקשה לאיפוס הסיסמה. הקישור בתוקף לשעה."
    : "We received a request to reset your password. This link expires in 1 hour.";
  const cta = isHe ? "איפוס סיסמה" : "Reset password";
  const ignore = isHe
    ? "אם לא ביקשת איפוס, אפשר להתעלם מהמייל הזה."
    : "If you did not request a reset, you can ignore this email.";

  const html = brandedHtml(
    title,
    `<p>${greeting}</p>
     <p>${intro}</p>
     <p style="text-align:center;margin:28px 0;">
       <a href="${resetUrl}" style="background:#359364;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;display:inline-block;font-weight:bold;">${cta}</a>
     </p>
     <p style="color:#64748b;font-size:13px;word-break:break-all;">${resetUrl}</p>
     <p style="color:#64748b;font-size:14px;">${ignore}</p>`,
    isHe ? "rtl" : "ltr"
  );
  const text = `${greeting}\n\n${intro}\n\n${resetUrl}\n\n${ignore}`;

  try {
    await deliverEmail(to, subject, html, text);
  } catch (error) {
    logger.error("Failed to send password reset email:", error);
    throw new AppError(
      "Could not send password reset email. Please try again.",
      502
    );
  }
}
