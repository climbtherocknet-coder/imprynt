import { redirect } from 'next/navigation';

export default function ShowcasePage() {
  redirect('/dashboard/profile#showcase');
}
