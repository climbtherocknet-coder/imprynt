import { NextRequest, NextResponse } from 'next/server';
import { sendFeedbackEmail } from '@/lib/email';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  // Rate limit: 5 feedback submissions per IP per 15 minutes
  const ip = getClientIp(req.headers);
  const rl = rateLimit(`feedback:${ip}`, 5, 15 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many submissions. Please try again later.' }, { status: 429 });
  }

  const { message, email, page } = await req.json();

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  await sendFeedbackEmail(message.trim().slice(0, 2000), email?.trim() || undefined, page || undefined);

  return NextResponse.json({ success: true });
}
