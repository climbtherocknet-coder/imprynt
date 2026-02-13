import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';
import AccountClient from './AccountClient';

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const userResult = await query(
    'SELECT email, first_name, last_name, plan, stripe_customer_id, created_at FROM users WHERE id = $1',
    [session.user.id]
  );
  const user = userResult.rows[0];
  if (!user) {
    redirect('/login');
  }

  // Check for active accessory orders
  const accessoryResult = await query(
    `SELECT product_type, status, tracking_number, created_at
     FROM accessories WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5`,
    [session.user.id]
  );

  return (
    <AccountClient
      user={{
        email: user.email,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        plan: user.plan,
        hasStripe: !!user.stripe_customer_id,
        createdAt: user.created_at,
      }}
      accessories={accessoryResult.rows.map((a: Record<string, unknown>) => ({
        productType: a.product_type as string,
        orderStatus: a.status as string,
        trackingNumber: (a.tracking_number as string) || '',
        createdAt: a.created_at as string,
      }))}
    />
  );
}
