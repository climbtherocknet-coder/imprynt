import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Public endpoint — no auth required. Returns QR code only if show_qr_button is enabled.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  const { profileId } = await params;

  const result = await query(
    'SELECT slug, show_qr_button FROM profiles WHERE id = $1',
    [profileId]
  );

  const row = result.rows[0];
  if (!row || !row.show_qr_button) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const slug = row.slug;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${req.nextUrl.protocol}//${req.nextUrl.host}`;
  const profileUrl = `${appUrl}/${slug}`;

  const format = req.nextUrl.searchParams.get('format') || 'svg';

  try {
    const QRCode = await import('qrcode');
    const qr = QRCode.default ?? QRCode;

    if (format === 'png') {
      const pngBuffer = await (qr as typeof import('qrcode')).toBuffer(profileUrl, {
        type: 'png',
        width: 512,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
        errorCorrectionLevel: 'M',
      });
      return new NextResponse(new Uint8Array(pngBuffer), {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    const svg = await (qr as typeof import('qrcode')).toString(profileUrl, {
      type: 'svg',
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    });

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'QR generation failed', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
