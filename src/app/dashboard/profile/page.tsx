import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import ProfileEditor from './ProfileEditor';

export default async function ProfileEditorPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  return <ProfileEditor />;
}
