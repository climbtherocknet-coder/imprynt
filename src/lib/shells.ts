import crypto from 'crypto';
import { query } from '@/lib/db';

/**
 * Generate a unique NFC ID: IMP-XXXXXXXX (uppercase alphanumeric, no ambiguous chars)
 */
function generateNfcId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = '';
  const bytes = crypto.randomBytes(8);
  for (let i = 0; i < 8; i++) {
    id += chars[bytes[i] % chars.length];
  }
  return `IMP-${id}`;
}

/**
 * Generate a unique invite code: SH-XXXXXXXX (uppercase alphanumeric)
 */
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  const bytes = crypto.randomBytes(8);
  for (let i = 0; i < 8; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return `SH-${code}`;
}

export interface ShellRecord {
  nfcId: string;
  inviteCode: string;
}

export interface GenerateBatchResult {
  batchId: string;
  shells: ShellRecord[];
}

/**
 * Generate a batch of pre-activated shells.
 * Each shell gets a unique nfcId and inviteCode.
 * No profile is created yet — that happens when the user claims.
 */
export async function generateBatch(
  name: string,
  quantity: number,
  tag: string | null,
  createdBy: string,
): Promise<GenerateBatchResult> {
  const batchResult = await query(
    `INSERT INTO shell_batches (name, quantity, tag, created_by)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [name, quantity, tag, createdBy]
  );
  const batchId = batchResult.rows[0].id;

  const shells: ShellRecord[] = [];

  for (let i = 0; i < quantity; i++) {
    let nfcId = generateNfcId();
    let inviteCode = generateInviteCode();

    // Ensure uniqueness with retry
    for (let attempt = 0; attempt < 5; attempt++) {
      const exists = await query(
        'SELECT 1 FROM shells WHERE nfc_id = $1 OR invite_code = $2',
        [nfcId, inviteCode]
      );
      if (exists.rows.length === 0) break;
      nfcId = generateNfcId();
      inviteCode = generateInviteCode();
    }

    await query(
      `INSERT INTO shells (batch_id, nfc_id, invite_code)
       VALUES ($1, $2, $3)`,
      [batchId, nfcId, inviteCode]
    );

    shells.push({ nfcId, inviteCode });
  }

  return { batchId, shells };
}
