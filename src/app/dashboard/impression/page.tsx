import { redirect } from 'next/navigation';

export default function ImpressionPage() {
  redirect('/dashboard/profile#impression');
}
