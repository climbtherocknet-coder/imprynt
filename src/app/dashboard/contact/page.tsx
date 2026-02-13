import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';
import ContactEditor from './ContactEditor';

export default async function ContactPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const contactResult = await query(
    `SELECT field_type, field_value, show_business, show_personal, display_order
     FROM contact_fields WHERE user_id = $1 ORDER BY display_order ASC`,
    [session.user.id]
  );

  return (
    <ContactEditor
      contactFields={contactResult.rows.map((f: Record<string, unknown>) => ({
        fieldType: f.field_type as string,
        fieldValue: f.field_value as string,
        showBusiness: f.show_business as boolean,
        showPersonal: f.show_personal as boolean,
      }))}
    />
  );
}
