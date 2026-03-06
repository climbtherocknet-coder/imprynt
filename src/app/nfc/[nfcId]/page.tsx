import { redirect } from 'next/navigation';
import { query } from '@/lib/db';
import ClaimPage from './ClaimPage';

export default async function NfcPage({
  params,
}: {
  params: Promise<{ nfcId: string }>;
}) {
  const { nfcId } = await params;

  // Look up the shell
  const result = await query(
    `SELECT s.id, s.status, s.invite_code, s.profile_id, p.slug
     FROM shells s
     LEFT JOIN profiles p ON p.id = s.profile_id
     WHERE s.nfc_id = $1`,
    [nfcId.toUpperCase()]
  );

  if (result.rows.length === 0) {
    // Unknown NFC ID — redirect to homepage
    redirect('/');
  }

  const shell = result.rows[0];

  if (shell.status === 'disabled') {
    redirect('/');
  }

  if (shell.status === 'claimed' && shell.slug) {
    // Log NFC tap analytics
    if (shell.profile_id) {
      query(
        `INSERT INTO analytics_events (profile_id, event_type, referral_source)
         VALUES ($1, 'nfc_tap', 'nfc')`,
        [shell.profile_id]
      ).catch(() => {});
    }
    redirect(`/${shell.slug}`);
  }

  // Shell is available — show claim page
  return <ClaimPage nfcId={nfcId.toUpperCase()} inviteCode={shell.invite_code} />;
}
