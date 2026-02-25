import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';

// POST - Register interest in a hardware product
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { product } = await req.json();
  const validProducts = ['sygnet_ring', 'armilla_band', 'tactus_fingertip', 'all'];

  if (!product || !validProducts.includes(product)) {
    return NextResponse.json({ error: 'Invalid product' }, { status: 400 });
  }

  try {
    if (product === 'all') {
      // Register interest in all products
      for (const p of ['sygnet_ring', 'armilla_band', 'tactus_fingertip']) {
        await query(
          `INSERT INTO hardware_waitlist (user_id, product)
           VALUES ($1, $2) ON CONFLICT (user_id, product) DO NOTHING`,
          [session.user.id, p]
        );
      }
    } else {
      await query(
        `INSERT INTO hardware_waitlist (user_id, product)
         VALUES ($1, $2) ON CONFLICT (user_id, product) DO NOTHING`,
        [session.user.id, product]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Hardware interest error:', error);
    return NextResponse.json({ error: 'Failed to register interest' }, { status: 500 });
  }
}

// GET - Check if user has registered interest
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await query(
      'SELECT product FROM hardware_waitlist WHERE user_id = $1',
      [session.user.id]
    );
    return NextResponse.json({
      products: result.rows.map((r: { product: string }) => r.product),
    });
  } catch {
    return NextResponse.json({ products: [] });
  }
}
