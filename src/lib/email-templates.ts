/**
 * HTML + plain-text email templates for Imprynt.
 *
 * Design: dark theme consistent with the app — #0c1017 background,
 * #e8a849 accent, Inter/system font stack.
 */

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Imprynt';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

function baseHtml(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0c1017;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0c1017;">
    <tr><td align="center" style="padding:40px 16px;">
      <table role="presentation" width="480" cellspacing="0" cellpadding="0" style="max-width:480px;width:100%;background:#161c28;border:1px solid #1e2535;border-radius:16px;overflow:hidden;">
        <!-- Logo -->
        <tr><td style="padding:32px 32px 0;text-align:center;">
          <span style="display:inline-block;width:28px;height:28px;border:2px solid #e8a849;border-radius:50%;vertical-align:middle;"></span>
          <span style="font-size:14px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#eceef2;vertical-align:middle;margin-left:8px;">${APP_NAME}</span>
        </td></tr>
        <!-- Content -->
        <tr><td style="padding:24px 32px 32px;color:#a8adb8;font-size:15px;line-height:1.6;">
          ${content}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:0 32px 24px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#5d6370;">
            &copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Password Reset ────────────────────────────────────

export function passwordResetHtml(resetUrl: string): string {
  return baseHtml(`
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:600;color:#eceef2;">Reset your password</h1>
    <p style="margin:0 0 24px;">We received a request to reset your password. Click the button below to choose a new one.</p>
    <p style="text-align:center;margin:0 0 24px;">
      <a href="${resetUrl}" style="display:inline-block;padding:12px 32px;background:#e8a849;color:#0c1017;font-size:15px;font-weight:600;text-decoration:none;border-radius:999px;">
        Reset Password
      </a>
    </p>
    <p style="margin:0 0 8px;font-size:13px;color:#5d6370;">This link expires in 1 hour.</p>
    <p style="margin:0;font-size:13px;color:#5d6370;">If you didn't request this, you can safely ignore this email.</p>
  `);
}

export function passwordResetText(resetUrl: string): string {
  return `Reset your ${APP_NAME} password

We received a request to reset your password. Visit this link to choose a new one:

${resetUrl}

This link expires in 1 hour. If you didn't request this, you can safely ignore this email.`;
}

// ── Welcome ───────────────────────────────────────────

export function welcomeHtml(firstName?: string): string {
  const greeting = firstName ? `Hi ${firstName}` : 'Welcome';
  return baseHtml(`
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:600;color:#eceef2;">${greeting}!</h1>
    <p style="margin:0 0 16px;">Thanks for joining ${APP_NAME}. Your account is ready — let's build your page.</p>
    <p style="text-align:center;margin:0 0 24px;">
      <a href="${APP_URL}/dashboard" style="display:inline-block;padding:12px 32px;background:#e8a849;color:#0c1017;font-size:15px;font-weight:600;text-decoration:none;border-radius:999px;">
        Go to Dashboard
      </a>
    </p>
    <p style="margin:0;font-size:13px;color:#5d6370;">If you have any questions, just reply to this email.</p>
  `);
}

export function welcomeText(firstName?: string): string {
  const greeting = firstName ? `Hi ${firstName}` : 'Welcome';
  return `${greeting}!

Thanks for joining ${APP_NAME}. Your account is ready — let's build your page.

${APP_URL}/dashboard

If you have any questions, just reply to this email.`;
}

// ── Email Verification ───────────────────────────────

export function verifyEmailHtml(verifyUrl: string, firstName?: string): string {
  const greeting = firstName ? `Hi ${firstName},` : 'Hi,';
  return baseHtml(`
    <p style="margin:0 0 16px;">${greeting}</p>
    <p style="margin:0 0 24px;">Please verify your email address to complete your ${APP_NAME} account setup.</p>
    <p style="margin:0 0 24px;text-align:center;">
      <a href="${verifyUrl}" style="display:inline-block;padding:12px 32px;background:#e8a849;color:#0c1017;font-size:15px;font-weight:600;text-decoration:none;border-radius:999px;">
        Verify Email
      </a>
    </p>
    <p style="margin:0;font-size:13px;color:#888;">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
  `);
}

export function verifyEmailText(verifyUrl: string, firstName?: string): string {
  const greeting = firstName ? `Hi ${firstName},` : 'Hi,';
  return `${greeting}

Please verify your email address to complete your ${APP_NAME} account setup.

Verify here: ${verifyUrl}

This link expires in 24 hours. If you didn't create an account, ignore this email.`;
}

// ── Waitlist Invite ──────────────────────────────────

export function waitlistInviteHtml(inviteCode: string): string {
  const registerUrl = `${APP_URL}/register?code=${encodeURIComponent(inviteCode)}`;
  return baseHtml(`
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:600;color:#eceef2;">You're in!</h1>
    <p style="margin:0 0 16px;">Great news — a spot has opened up for you on ${APP_NAME}. Use the invite code below to create your account.</p>
    <div style="text-align:center;margin:0 0 24px;padding:16px;background:#0c1017;border-radius:12px;border:1px solid #1e2535;">
      <span style="font-size:28px;font-weight:700;letter-spacing:0.15em;color:#e8a849;font-family:monospace;">${inviteCode}</span>
    </div>
    <p style="text-align:center;margin:0 0 24px;">
      <a href="${registerUrl}" style="display:inline-block;padding:12px 32px;background:#e8a849;color:#0c1017;font-size:15px;font-weight:600;text-decoration:none;border-radius:999px;">
        Create Your Account
      </a>
    </p>
    <p style="margin:0;font-size:13px;color:#5d6370;">This code is single-use. If you have any questions, just reply to this email.</p>
  `);
}

export function waitlistInviteText(inviteCode: string): string {
  const registerUrl = `${APP_URL}/register?code=${encodeURIComponent(inviteCode)}`;
  return `You're in!

Great news — a spot has opened up for you on ${APP_NAME}. Use the invite code below to create your account.

Your invite code: ${inviteCode}

Sign up here: ${registerUrl}

This code is single-use. If you have any questions, just reply to this email.`;
}
