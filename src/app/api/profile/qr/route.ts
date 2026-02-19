import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';
import QRCode from 'qrcode';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await query(
    'SELECT slug FROM profiles WHERE user_id = $1',
    [session.user.id]
  );
  if (!result.rows[0]) {
    return NextResponse.json({ error: 'No profile found' }, { status: 404 });
  }

  const slug = result.rows[0].slug;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://imprynt.io';
  const profileUrl = `${appUrl}/${slug}`;

  const format = req.nextUrl.searchParams.get('format') || 'svg';

  if (format === 'png') {
    const pngBuffer = await QRCode.toBuffer(profileUrl, {
      type: 'png',
      width: 512,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    });
    return new NextResponse(pngBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'attachment; filename="imprynt-qr.png"',
        'Cache-Control': 'no-store',
      },
    });
  }

  const svg = await QRCode.toString(profileUrl, {
    type: 'svg',
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' },
    errorCorrectionLevel: 'M',
  });

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-store',
    },
  });
}
