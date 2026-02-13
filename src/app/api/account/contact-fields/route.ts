import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';

const VALID_FIELD_TYPES = [
  'phone_cell', 'phone_work', 'phone_personal',
  'email_work', 'email_personal',
  'address_work', 'address_home',
  'birthday', 'pronouns', 'name_suffix', 'company'
];

// GET - Load all contact fields for current user
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await query(
    `SELECT id, field_type, field_value, show_business, show_personal, display_order
     FROM contact_fields
     WHERE user_id = $1
     ORDER BY display_order ASC`,
    [session.user.id]
  );

  const fields = result.rows.map(row => ({
    id: row.id,
    fieldType: row.field_type,
    fieldValue: row.field_value,
    showBusiness: row.show_business,
    showPersonal: row.show_personal,
    displayOrder: row.display_order,
  }));

  return NextResponse.json({ fields });
}

// PUT - Batch save all contact fields (delete + re-insert)
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await req.json();
  const { fields } = body;

  if (!Array.isArray(fields)) {
    return NextResponse.json({ error: 'Fields must be an array' }, { status: 400 });
  }

  // Validate all fields before saving
  for (const field of fields) {
    if (!VALID_FIELD_TYPES.includes(field.fieldType)) {
      return NextResponse.json({ error: `Invalid field type: ${field.fieldType}` }, { status: 400 });
    }
  }

  // Filter out empty fields
  const nonEmpty = fields.filter((f: Record<string, unknown>) => (f.fieldValue as string)?.trim());

  // Delete existing and re-insert (simplest batch save pattern)
  await query('DELETE FROM contact_fields WHERE user_id = $1', [userId]);

  for (let i = 0; i < nonEmpty.length; i++) {
    const f = nonEmpty[i];
    await query(
      `INSERT INTO contact_fields (user_id, field_type, field_value, show_business, show_personal, display_order)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        userId,
        f.fieldType,
        f.fieldValue.trim().slice(0, 500),
        f.showBusiness !== false, // default true
        f.showPersonal !== false, // default true
        i,
      ]
    );
  }

  return NextResponse.json({ success: true, count: nonEmpty.length });
}

// DELETE - Remove a single contact field by type
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const fieldType = searchParams.get('fieldType');

  if (!fieldType || !VALID_FIELD_TYPES.includes(fieldType)) {
    return NextResponse.json({ error: 'Valid field type required' }, { status: 400 });
  }

  await query(
    'DELETE FROM contact_fields WHERE user_id = $1 AND field_type = $2',
    [session.user.id, fieldType]
  );

  return NextResponse.json({ success: true });
}
