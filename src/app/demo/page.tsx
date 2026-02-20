import { query } from '@/lib/db';
import DemoShowcase from './DemoShowcase';
import '@/styles/demo.css';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'See Imprynt in Action — Live Demo',
  description:
    'Explore 10 live demo profiles. Pick a template, try the PIN unlock, and see every Imprynt feature in action.',
  robots: { index: true, follow: true },
};

export interface DemoProfile {
  slug: string;
  template: string;
  firstName: string;
  lastName: string;
  title: string | null;
  company: string | null;
  tagline: string | null;
  photoUrl: string | null;
  photoShape: string;
  accentColor: string | null;
  showQrButton: boolean;
  statusTags: string[] | null;
  hasProtectedPage: boolean;
}

async function getDemoProfiles(): Promise<DemoProfile[]> {
  try {
    const result = await query(
      `SELECT u.first_name, u.last_name, p.user_id,
              p.slug, p.template, p.title, p.company, p.tagline,
              p.photo_url, p.photo_shape, p.status_tags,
              p.accent_color, p.show_qr_button
       FROM users u
       JOIN profiles p ON p.user_id = u.id
       WHERE u.is_demo = true AND p.is_published = true
       ORDER BY CASE p.template
         WHEN 'clean'     THEN 1
         WHEN 'warm'      THEN 2
         WHEN 'classic'   THEN 3
         WHEN 'soft'      THEN 4
         WHEN 'midnight'  THEN 5
         WHEN 'editorial' THEN 6
         WHEN 'noir'      THEN 7
         WHEN 'signal'    THEN 8
         WHEN 'studio'    THEN 9
         WHEN 'dusk'      THEN 10
         ELSE 99
       END`
    );

    const profiles = result.rows;

    const enriched = await Promise.all(
      profiles.map(async (p) => {
        let hasProtectedPage = false;
        try {
          const ppResult = await query(
            'SELECT 1 FROM protected_pages WHERE user_id = $1 AND is_active = true LIMIT 1',
            [p.user_id]
          );
          hasProtectedPage = ppResult.rows.length > 0;
        } catch {
          /* protected_pages table may not exist yet */
        }

        return {
          slug: p.slug as string,
          template: p.template as string,
          firstName: (p.first_name as string) || '',
          lastName: (p.last_name as string) || '',
          title: (p.title as string) || null,
          company: (p.company as string) || null,
          tagline: (p.tagline as string) || null,
          photoUrl: (p.photo_url as string) || null,
          photoShape: (p.photo_shape as string) || 'circle',
          accentColor: (p.accent_color as string) || null,
          showQrButton: !!p.show_qr_button,
          statusTags: (p.status_tags as string[]) || null,
          hasProtectedPage,
        } satisfies DemoProfile;
      })
    );

    return enriched;
  } catch {
    // is_demo column may not exist yet, or other DB error
    return [];
  }
}

export default async function DemoPage() {
  const profiles = await getDemoProfiles();
  return <DemoShowcase profiles={profiles} />;
}
