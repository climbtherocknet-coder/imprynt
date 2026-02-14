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
  verifyEmailHtml,
  verifyEmailText,
  waitlistInviteHtml,
  waitlistInviteText,
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

export async function sendFeedbackEmail(
  message: string,
  senderEmail?: string,
  page?: string
): Promise<boolean> {
  const feedbackTo = process.env.FEEDBACK_EMAIL || 'tim@imprynt.io';
  return sendEmail({
    to: feedbackTo,
    subject: `Imprynt Feedback${senderEmail ? ` from ${senderEmail}` : ''}`,
    html: `<div style="font-family:sans-serif;color:#333;">
      <h2>New Feedback</h2>
      ${senderEmail ? `<p><strong>From:</strong> ${senderEmail}</p>` : ''}
      ${page ? `<p><strong>Page:</strong> ${page}</p>` : ''}
      <p style="white-space:pre-wrap;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
    </div>`,
    text: `New Feedback\n${senderEmail ? `From: ${senderEmail}\n` : ''}${page ? `Page: ${page}\n` : ''}\n${message}`,
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

export async function sendVerificationEmail(
  to: string,
  verifyUrl: string,
  firstName?: string
): Promise<boolean> {
  return sendEmail({
    to,
    subject: 'Verify your Imprynt email',
    html: verifyEmailHtml(verifyUrl, firstName),
    text: verifyEmailText(verifyUrl, firstName),
  });
}

export async function sendWaitlistInviteEmail(
  to: string,
  inviteCode: string
): Promise<boolean> {
  return sendEmail({
    to,
    subject: "You're invited to Imprynt!",
    html: waitlistInviteHtml(inviteCode),
    text: waitlistInviteText(inviteCode),
  });
}
