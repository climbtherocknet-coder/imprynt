import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';
import { getPlanStatus } from '@/lib/plan';
import PageEditor from './PageEditor';

export default async function PageEditorPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const params = await searchParams;

  const userResult = await query(
    'SELECT id, plan, trial_started_at, trial_ends_at FROM users WHERE id = $1',
    [session.user.id]
  );
  const user = userResult.rows[0];
  if (!user) redirect('/login');

  const planStatus = getPlanStatus(user);

  return (
    <PageEditor
      userId={user.id}
      planStatus={{
        plan: planStatus.plan,
        isPaid: planStatus.isPaid,
        isTrialing: planStatus.isTrialing,
        trialDaysLeft: planStatus.trialDaysLeft,
        trialEndsAt: planStatus.trialEndsAt?.toISOString() || null,
        badgeLabel: planStatus.badgeLabel,
        showBilling: planStatus.showBilling,
        trialUsed: !!user.trial_started_at,
      }}
      initialTab={params.tab || 'profile'}
    />
  );
}
