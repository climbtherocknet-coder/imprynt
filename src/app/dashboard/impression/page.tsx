import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';
import ImpressionEditor from './ImpressionEditor';

export default async function ImpressionPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  // Check plan
  const userResult = await query('SELECT plan FROM users WHERE id = $1', [session.user.id]);
  const plan = userResult.rows[0]?.plan;
  if (plan === 'free') {
    redirect('/dashboard');
  }

  return <ImpressionEditor />;
}
