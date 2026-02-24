import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { parseListingUrl, extractPrice, extractDetails } from '@/lib/listing-parser';

// GET /api/og-preview?url=https://...
// Fetches Open Graph metadata from a URL
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = req.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'URL required' }, { status: 400 });
  }

  // Validate URL format
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  // Block internal/private network URLs (SSRF prevention)
  const hostname = parsed.hostname.toLowerCase();
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.startsWith('172.') ||
    hostname.endsWith('.local')
  ) {
    return NextResponse.json({ error: 'Internal URLs not allowed' }, { status: 400 });
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return NextResponse.json({ error: 'Only HTTP/HTTPS URLs supported' }, { status: 400 });
  }

  const mode = req.nextUrl.searchParams.get('mode');

  // Strategy 1: Direct fetch with browser-like headers
  const directResult = await fetchDirect(url, parsed);

  // Strategy 2: Fallback to microlink.io for bot-protected sites
  const microlinkResult = !directResult ? await fetchViaMicrolink(url, parsed) : null;

  const baseResult = directResult || microlinkResult;

  // Listing mode: enrich with structured data from URL + HTML
  if (mode === 'listing') {
    const listingMeta = parseListingUrl(url);
    const base = baseResult || { url, title: '', description: '', image: '', siteName: '', domain: parsed.hostname.replace(/^www\./, '') };

    // Try to extract price/details from title+description
    const combined = `${base.title} ${base.description}`;
    const price = extractPrice(combined);
    const details = extractDetails(combined);

    // Use address from URL parser as fallback title
    if (!base.title && listingMeta.address) {
      base.title = listingMeta.address;
    }

    return NextResponse.json({
      ...base,
      listing: {
        source: listingMeta.source,
        address: listingMeta.address || base.title || '',
        price: price || '',
        details,
        imageBlocked: listingMeta.imageBlocked,
        zpid: listingMeta.zpid,
      },
    });
  }

  if (baseResult) {
    return NextResponse.json(baseResult);
  }

  return NextResponse.json({ error: 'Could not auto-fetch preview — this site may block previews. You can enter the details manually.' }, { status: 422 });
}

// ── Strategy 1: Direct fetch ────────────────────────────

async function fetchDirect(url: string, parsed: URL) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'identity',
        'Cache-Control': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
      },
      redirect: 'follow',
    });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return null;

    // Read only the first 50KB
    const reader = res.body?.getReader();
    if (!reader) return null;

    let html = '';
    const decoder = new TextDecoder();
    const maxBytes = 50 * 1024;
    let bytesRead = 0;

    while (bytesRead < maxBytes) {
      const { done, value } = await reader.read();
      if (done) break;
      html += decoder.decode(value, { stream: true });
      bytesRead += value.length;
    }
    reader.cancel();

    // Detect bot-protection / access-denied pages
    const lowerHtml = html.toLowerCase();
    if (
      lowerHtml.includes('access to this page has been denied') ||
      lowerHtml.includes('access denied') ||
      lowerHtml.includes('please verify you are a human') ||
      lowerHtml.includes('captcha') ||
      lowerHtml.includes('challenge-platform')
    ) {
      return null; // Fall through to Microlink
    }

    // Extract OG tags
    const ogTitle = extractMeta(html, 'og:title') || extractTag(html, 'title') || '';
    if (!ogTitle) return null; // If no title found, page is likely a captcha/block page

    const ogImage = extractMeta(html, 'og:image') || extractMeta(html, 'twitter:image') || '';
    const ogDescription = extractMeta(html, 'og:description') || extractMeta(html, 'description') || '';
    const ogSiteName = extractMeta(html, 'og:site_name') || '';

    // Resolve relative image URLs
    let resolvedImage = ogImage;
    if (ogImage && !ogImage.startsWith('http')) {
      try {
        resolvedImage = new URL(ogImage, url).href;
      } catch {
        resolvedImage = '';
      }
    }

    // Validate OG image URL with a HEAD request
    if (resolvedImage) {
      resolvedImage = await validateImageUrl(resolvedImage);
    }

    return {
      url,
      title: ogTitle.slice(0, 200),
      description: ogDescription.slice(0, 500),
      image: resolvedImage.slice(0, 1000),
      siteName: ogSiteName.slice(0, 100),
      domain: parsed.hostname.replace(/^www\./, ''),
    };
  } catch {
    return null;
  }
}

// ── Strategy 2: Microlink.io fallback ───────────────────
// Free tier: 50 req/day, no API key needed

async function fetchViaMicrolink(url: string, parsed: URL) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const apiUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}`;
    const res = await fetch(apiUrl, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
    });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const json = await res.json();
    if (json.status !== 'success' || !json.data) return null;

    const d = json.data;
    return {
      url,
      title: (d.title || '').slice(0, 200),
      description: (d.description || '').slice(0, 500),
      image: (d.image?.url || '').slice(0, 1000),
      siteName: (d.publisher || '').slice(0, 100),
      domain: parsed.hostname.replace(/^www\./, ''),
    };
  } catch {
    return null;
  }
}

// ── HTML parsing helpers ────────────────────────────────

function extractMeta(html: string, name: string): string {
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${escapeRegex(name)}["'][^>]+content=["']([^"']*?)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']*?)["'][^>]+(?:property|name)=["']${escapeRegex(name)}["']`, 'i'),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeHTMLEntities(match[1].trim());
  }
  return '';
}

function extractTag(html: string, tag: string): string {
  const match = html.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, 'i'));
  return match?.[1] ? decodeHTMLEntities(match[1].trim()) : '';
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function decodeHTMLEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)));
}

// ── Validate OG image URL via HEAD request ──────────────
async function validateImageUrl(imageUrl: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(imageUrl, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      redirect: 'follow',
    });
    clearTimeout(timeout);
    if (!res.ok) return '';
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) return '';
    return imageUrl;
  } catch {
    return '';
  }
}
