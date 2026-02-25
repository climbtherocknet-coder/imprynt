import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';
import SetupWizard from './SetupWizard';

export default async function SetupPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const userResult = await query(
    'SELECT setup_completed, plan, setup_step FROM users WHERE id = $1',
    [session.user.id]
  );
  const user = userResult.rows[0];
  if (!user) redirect('/login');
  if (user.setup_completed) redirect('/dashboard');

  const isPaid = user.plan !== 'free';
  return <SetupWizard isPaid={isPaid} initialStep={user.setup_step || 1} />;
}
