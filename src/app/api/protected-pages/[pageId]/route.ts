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
    `SELECT pp.id, pp.page_title, pp.visibility_mode, pp.bio_text, pp.button_label, pp.resume_url, pp.show_resume,
            pp.photo_url as personal_photo_url,
            pp.photo_shape, pp.photo_radius, pp.photo_size, pp.photo_position_x, pp.photo_position_y,
            pp.photo_animation, pp.photo_align,
            pp.cover_url as page_cover_url, pp.cover_opacity as page_cover_opacity, pp.cover_position_y as page_cover_position_y,
            pp.bg_image_url as page_bg_image_url, pp.bg_image_opacity as page_bg_image_opacity, pp.bg_image_position_y as page_bg_image_position_y,
            pp.photo_zoom as page_photo_zoom, pp.cover_position_x as page_cover_position_x, pp.cover_zoom as page_cover_zoom,
            pp.bg_image_position_x as page_bg_image_position_x, pp.bg_image_zoom as page_bg_image_zoom,
            p.link_size, p.link_shape, p.link_button_color, p.link_display,
            p.save_button_style, p.save_button_color,
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

  // Fetch custom_theme separately (migration 036 may not be run yet)
  let customTheme: Record<string, string> | null = null;
  try {
    const ctResult = await query('SELECT custom_theme FROM profiles WHERE id = $1', [page.profile_id]);
    customTheme = ctResult.rows[0]?.custom_theme || null;
  } catch { /* column doesn't exist yet */ }

  // Fetch links based on visibility mode (personal for impression, showcase for visible)
  const visibilityFlag = page.visibility_mode === 'hidden' ? 'show_personal' : 'show_showcase';
  const linksResult = await query(
    `SELECT id, link_type, label, url, display_order, button_color
     FROM links
     WHERE profile_id = $1 AND ${visibilityFlag} = true AND is_active = true
     ORDER BY display_order ASC`,
    [page.profile_id]
  );

  // Fetch pods for this protected page
  const podsResult = await query(
    `SELECT id, pod_type, display_order, label, title, body,
            image_url, stats, cta_label, cta_url, tags, image_position,
            listing_status, listing_price, listing_details, source_domain, auto_remove_at, sold_at,
            event_start, event_end, event_venue, event_address, event_status, event_auto_hide, event_timezone,
            audio_url, audio_duration
     FROM pods
     WHERE protected_page_id = $1 AND is_active = true
       AND (auto_remove_at IS NULL OR auto_remove_at > NOW())
       AND NOT (pod_type = 'event' AND event_auto_hide = true AND event_end IS NOT NULL AND event_end < to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI'))
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
      showResume: page.show_resume !== false,
      photoShape: page.photo_shape || 'circle',
      photoRadius: page.photo_radius,
      photoSize: page.photo_size || 'medium',
      photoPositionX: page.photo_position_x ?? 50,
      photoPositionY: page.photo_position_y ?? 50,
      photoAnimation: page.photo_animation || 'none',
      photoAlign: page.photo_align || 'center',
      coverUrl: page.page_cover_url || '',
      coverOpacity: page.page_cover_opacity ?? 30,
      coverPositionY: page.page_cover_position_y ?? 50,
      bgImageUrl: page.page_bg_image_url || '',
      bgImageOpacity: page.page_bg_image_opacity ?? 20,
      bgImagePositionY: page.page_bg_image_position_y ?? 50,
      photoZoom: page.page_photo_zoom ?? 100,
      coverPositionX: page.page_cover_position_x ?? 50,
      coverZoom: page.page_cover_zoom ?? 100,
      bgImagePositionX: page.page_bg_image_position_x ?? 50,
      bgImageZoom: page.page_bg_image_zoom ?? 100,
      linkSize: page.link_size || 'medium',
      linkShape: page.link_shape || 'pill',
      linkButtonColor: page.link_button_color || null,
      linkDisplay: page.link_display || 'default',
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
      customTheme,
      saveButtonStyle: page.save_button_style || 'auto',
      saveButtonColor: page.save_button_color || null,
    },
    links: linksResult.rows.map((l: Record<string, unknown>) => ({
      id: l.id,
      linkType: l.link_type,
      label: l.label || '',
      url: l.url,
      buttonColor: (l.button_color as string) || null,
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
      listingStatus: (r.listing_status as string) || 'active',
      listingPrice: (r.listing_price as string) || '',
      listingDetails: (r.listing_details as Record<string, string>) || {},
      sourceDomain: (r.source_domain as string) || '',
      eventStart: (r.event_start as string) || '',
      eventEnd: (r.event_end as string) || '',
      eventVenue: (r.event_venue as string) || '',
      eventAddress: (r.event_address as string) || '',
      eventStatus: (r.event_status as string) || 'upcoming',
      eventAutoHide: (r.event_auto_hide as boolean) ?? true,
      eventTimezone: (r.event_timezone as string) || '',
      audioUrl: (r.audio_url as string) || '',
      audioDuration: (r.audio_duration as number) || 0,
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
