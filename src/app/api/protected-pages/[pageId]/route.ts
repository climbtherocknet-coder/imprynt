import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Fetch protected page content (public, after PIN verification)
// The client must have verified the PIN first via /api/pin
// We use the pageId directly since the client only gets it after successful PIN check
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await params;

  if (!pageId) {
    return NextResponse.json({ error: 'Page ID required' }, { status: 400 });
  }

  // Fetch page + profile info
  const pageResult = await query(
    `SELECT pp.id, pp.page_title, pp.visibility_mode, pp.bio_text, pp.button_label, pp.resume_url,
            pp.photo_url as personal_photo_url,
            p.template, p.primary_color, p.accent_color, p.font_pair,
            u.first_name, u.last_name, p.photo_url, p.title as profile_title,
            p.company, p.slug, p.id as profile_id
     FROM protected_pages pp
     JOIN profiles p ON p.id = pp.profile_id
     JOIN users u ON u.id = pp.user_id
     WHERE pp.id = $1 AND pp.is_active = true`,
    [pageId]
  );

  if (pageResult.rows.length === 0) {
    return NextResponse.json({ error: 'Page not found' }, { status: 404 });
  }

  const page = pageResult.rows[0];

  // Fetch links based on visibility mode (personal for impression, showcase for visible)
  const visibilityFlag = page.visibility_mode === 'hidden' ? 'show_personal' : 'show_showcase';
  const linksResult = await query(
    `SELECT id, link_type, label, url, display_order
     FROM links
     WHERE profile_id = $1 AND ${visibilityFlag} = true AND is_active = true
     ORDER BY display_order ASC`,
    [page.profile_id]
  );

  // Fetch pods for this protected page
  const podsResult = await query(
    `SELECT id, pod_type, display_order, label, title, body,
            image_url, stats, cta_label, cta_url, tags, image_position
     FROM pods
     WHERE protected_page_id = $1 AND is_active = true
     ORDER BY display_order ASC`,
    [pageId]
  );

  // Fetch showcase items if this is a visible (showcase) page (backward compat)
  let showcaseItems: Record<string, unknown>[] = [];
  if (page.visibility_mode === 'visible') {
    const itemsResult = await query(
      `SELECT id, title, description, image_url, link_url, tags, item_date, display_order
       FROM showcase_items
       WHERE protected_page_id = $1 AND is_active = true
       ORDER BY display_order ASC`,
      [pageId]
    );
    showcaseItems = itemsResult.rows;
  }

  return NextResponse.json({
    page: {
      id: page.id,
      pageTitle: page.page_title,
      visibilityMode: page.visibility_mode,
      bioText: page.bio_text || '',
      resumeUrl: page.resume_url || '',
    },
    profile: {
      firstName: page.first_name,
      lastName: page.last_name,
      photoUrl: page.personal_photo_url || page.photo_url,
      title: page.profile_title,
      company: page.company,
      slug: page.slug,
      template: page.template,
      primaryColor: page.primary_color,
      accentColor: page.accent_color,
      fontPair: page.font_pair,
    },
    links: linksResult.rows.map((l: Record<string, unknown>) => ({
      id: l.id,
      linkType: l.link_type,
      label: l.label || '',
      url: l.url,
    })),
    pods: podsResult.rows.map((r: Record<string, unknown>) => ({
      id: r.id,
      podType: r.pod_type,
      label: (r.label as string) || '',
      title: (r.title as string) || '',
      body: (r.body as string) || '',
      imageUrl: (r.image_url as string) || '',
      stats: (r.stats as { num: string; label: string }[]) || [],
      ctaLabel: (r.cta_label as string) || '',
      ctaUrl: (r.cta_url as string) || '',
      tags: (r.tags as string) || '',
      imagePosition: (r.image_position as string) || 'left',
    })),
    showcaseItems: showcaseItems.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description || '',
      imageUrl: s.image_url || '',
      linkUrl: s.link_url || '',
      tags: s.tags || '',
      itemDate: s.item_date || '',
    })),
  });
}
