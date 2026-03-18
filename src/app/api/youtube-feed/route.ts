import { NextRequest, NextResponse } from 'next/server';

interface Video {
  id: string;
  title: string;
  thumbnailUrl: string;
  url: string;
  publishedAt: string;
}

async function resolveChannelId(channelUrl: string): Promise<string | null> {
  // Direct channel ID URL: /channel/UCxxxxx
  const channelMatch = channelUrl.match(/\/channel\/(UC[a-zA-Z0-9_-]+)/);
  if (channelMatch) return channelMatch[1];

  // Handle /@handle, /c/, /user/ URLs — fetch page and extract channelId
  const res = await fetch(channelUrl, {
    next: { revalidate: 3600 },
    headers: { 'User-Agent': 'Mozilla/5.0' },
  } as RequestInit);
  if (!res.ok) return null;

  const html = await res.text();

  // Try <meta itemprop="channelId" content="...">
  const metaMatch = html.match(/itemprop="channelId"\s+content="(UC[a-zA-Z0-9_-]+)"/);
  if (metaMatch) return metaMatch[1];

  // Try <link rel="canonical" href="...channel/UC...">
  const canonicalMatch = html.match(/\/channel\/(UC[a-zA-Z0-9_-]+)/);
  if (canonicalMatch) return canonicalMatch[1];

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { channelUrl } = await req.json();
    if (!channelUrl || typeof channelUrl !== 'string') {
      return NextResponse.json({ error: 'Missing channelUrl' }, { status: 400 });
    }

    const channelId = await resolveChannelId(channelUrl);
    if (!channelId) {
      return NextResponse.json({ error: 'Could not load videos. Check your channel URL.' });
    }

    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const feedRes = await fetch(feedUrl, {
      next: { revalidate: 3600 },
    } as RequestInit);
    if (!feedRes.ok) {
      return NextResponse.json({ error: 'Could not load videos. Check your channel URL.' });
    }

    const xml = await feedRes.text();

    // Parse entries from the XML feed using regex
    const videos: Video[] = [];
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let entryMatch;
    while ((entryMatch = entryRegex.exec(xml)) !== null && videos.length < 15) {
      const entry = entryMatch[1];
      const videoIdMatch = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
      const titleMatch = entry.match(/<title>(.*?)<\/title>/);
      const publishedMatch = entry.match(/<published>(.*?)<\/published>/);

      if (videoIdMatch) {
        const videoId = videoIdMatch[1];
        videos.push({
          id: videoId,
          title: titleMatch?.[1]?.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'") || '',
          thumbnailUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
          url: `https://www.youtube.com/watch?v=${videoId}`,
          publishedAt: publishedMatch?.[1] || '',
        });
      }
    }

    return NextResponse.json({ videos });
  } catch {
    return NextResponse.json({ error: 'Could not load videos. Check your channel URL.' });
  }
}
