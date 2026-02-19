import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function ProfileEditorPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  redirect('/dashboard/page-editor?tab=profile');
}
