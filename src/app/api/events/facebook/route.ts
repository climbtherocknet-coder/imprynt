import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { url } = await req.json();
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'URL required' }, { status: 400 });
  }

  // Validate it looks like a Facebook event URL
  const fbEventPattern = /facebook\.com\/(events\/\d+|events\/[a-zA-Z0-9-]+)/;
  if (!fbEventPattern.test(url)) {
    return NextResponse.json({ error: 'Not a valid Facebook event URL' }, { status: 400 });
  }

  try {
    // Dynamic import since the package is ESM
    const { scrapeFbEvent } = await import('facebook-event-scraper');
    const data = await scrapeFbEvent(url);

    // Map Facebook event data to our pod fields
    const result: Record<string, string> = {};

    if (data.name) result.title = data.name;
    if (data.description) result.body = data.description.slice(0, 500);
    if (data.photo?.url) result.imageUrl = data.photo.url;
    if (data.photo?.imageUri) result.imageUrl = data.photo.imageUri;
    if (data.ticketUrl) {
      result.ctaUrl = data.ticketUrl;
      result.ctaLabel = 'Get Tickets';
    }
    // If no ticket URL, use the Facebook event URL itself as the CTA
    if (!result.ctaUrl) {
      result.ctaUrl = url;
      result.ctaLabel = 'View on Facebook';
    }

    // Location
    if (data.location?.name) result.eventVenue = data.location.name;
    const addrParts: string[] = [];
    if (data.location?.address) addrParts.push(data.location.address);
    if (data.location?.city?.name) addrParts.push(data.location.city.name);
    if ((data.location?.city as Record<string, unknown>)?.stateAbbreviation) addrParts.push(String((data.location!.city as Record<string, unknown>).stateAbbreviation));
    if (addrParts.length > 0) result.eventAddress = addrParts.join(', ');

    // Date/time — the scraper returns startTimestamp and endTimestamp (unix seconds)
    if (data.startTimestamp) {
      const d = new Date(data.startTimestamp * 1000);
      result.eventStart = d.toISOString();
    }
    if (data.endTimestamp) {
      const d = new Date(data.endTimestamp * 1000);
      result.eventEnd = d.toISOString();
    }

    // Flag whether we got timestamps so the frontend can convert to local
    result._hasTimestamps = data.startTimestamp ? 'true' : 'false';

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch event data';
    return NextResponse.json({ error: message, fallback: true }, { status: 422 });
  }
}
