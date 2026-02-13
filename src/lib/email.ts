/**
 * Email sending via Resend.
 *
 * Requires:
 *   RESEND_API_KEY  — your Resend API key
 *   EMAIL_FROM      — sender address (e.g. "Imprynt <no-reply@imprynt.io>")
 *
 * If RESEND_API_KEY is not set, falls back to console.log so development
 * keeps working without an email provider.
 */

import {
  passwordResetHtml,
  passwordResetText,
  welcomeHtml,
  welcomeText,
} from '@/lib/email-templates';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'Imprynt <no-reply@imprynt.io>';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.log('========================================');
    console.log(`EMAIL (no RESEND_API_KEY — printing instead)`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Text:\n${text}`);
    console.log('========================================');
    return true;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: EMAIL_FROM, to, subject, html, text }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error('Resend API error:', res.status, body);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Email send error:', err);
    return false;
  }
}

// ── Public helpers ────────────────────────────────────

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<boolean> {
  return sendEmail({
    to,
    subject: 'Reset your Imprynt password',
    html: passwordResetHtml(resetUrl),
    text: passwordResetText(resetUrl),
  });
}

export async function sendWelcomeEmail(
  to: string,
  firstName?: string
): Promise<boolean> {
  return sendEmail({
    to,
    subject: 'Welcome to Imprynt',
    html: welcomeHtml(firstName),
    text: welcomeText(firstName),
  });
}
