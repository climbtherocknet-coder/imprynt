import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/lib/auth';
import { sendFeedbackEmail } from '@/lib/email';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  // Rate limit: 5 feedback submissions per IP per 15 minutes
  const ip = getClientIp(req.headers);
  const rl = rateLimit(`feedback:${ip}`, 5, 15 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many submissions. Please try again later.' }, { status: 429 });
  }

  const { message, email, page, feedbackType, reportedProfileId } = await req.json();

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  const type = feedbackType === 'report' ? 'report' : 'feedback';
  const status = type === 'report' ? 'report' : 'new';

  // Check if user is logged in
  let userId: string | null = null;
  let userEmail: string | null = email?.trim() || null;
  try {
    const session = await auth();
    if (session?.user?.id) {
      userId = session.user.id;
      if (!userEmail && session.user.email) {
        userEmail = session.user.email;
      }
    }
  } catch { /* not logged in */ }

  // Insert into database
  await query(
    `INSERT INTO feedback (user_id, email, message, page_url, reported_profile_id, feedback_type, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      userId,
      userEmail,
      message.trim().slice(0, 2000),
      page?.slice(0, 500) || null,
      type === 'report' ? reportedProfileId || null : null,
      type,
      status,
    ]
  );

  // Send notification email (fire-and-forget)
  sendFeedbackEmail(
    message.trim().slice(0, 2000),
    userEmail || undefined,
    page || undefined,
  ).catch(() => {});

  return NextResponse.json({ success: true });
}
