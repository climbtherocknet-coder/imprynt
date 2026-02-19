export interface PlanStatus {
  plan: string;
  isPaid: boolean;
  isTrialing: boolean;
  trialDaysLeft: number;
  trialEndsAt: Date | null;
  badgeLabel: string;
  showBilling: boolean;
}

export function getPlanStatus(user: {
  plan: string;
  trial_ends_at?: string | Date | null;
  trial_started_at?: string | Date | null;
  stripe_customer_id?: string | null;
}): PlanStatus {
  const plan = user.plan || 'free';
  const trialEndsAt = user.trial_ends_at ? new Date(user.trial_ends_at) : null;
  const isTrialing = !!trialEndsAt && trialEndsAt > new Date();
  const trialDaysLeft = isTrialing
    ? Math.ceil((trialEndsAt!.getTime() - Date.now()) / 86400000)
    : 0;

  const isPaid = plan !== 'free' || isTrialing;

  let badgeLabel = 'Free';
  if (plan === 'advisory') badgeLabel = 'Advisory';
  else if (plan !== 'free') badgeLabel = 'Premium';
  else if (isTrialing) badgeLabel = `Trial (${trialDaysLeft}d)`;

  // Advisory users and trialing users don't need billing UI
  const showBilling = plan !== 'advisory' && plan !== 'free';

  return { plan, isPaid, isTrialing, trialDaysLeft, trialEndsAt, badgeLabel, showBilling };
}
