import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/admin';
import AdminClient from './AdminClient';

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    redirect('/dashboard');
  }
  return <AdminClient adminEmail={session.user.email} />;
}
