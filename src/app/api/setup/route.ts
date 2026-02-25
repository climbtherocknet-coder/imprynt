import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';

// PUT - Track wizard step progress
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { step } = await req.json();
    if (!step || step < 1 || step > 7) {
      return NextResponse.json({ error: 'Invalid step' }, { status: 400 });
    }

    await query(
      'UPDATE users SET setup_step = GREATEST(setup_step, $1) WHERE id = $2',
      [step, session.user.id]
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Setup step update error:', error);
    return NextResponse.json({ error: 'Failed to update step' }, { status: 500 });
  }
}
