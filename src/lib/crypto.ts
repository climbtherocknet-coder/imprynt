import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex) throw new Error('ENCRYPTION_KEY env var is required');
  return Buffer.from(hex, 'hex');
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${tag}:${encrypted}`;
}

export function decrypt(data: string): string {
  const [ivHex, tagHex, ciphertext] = data.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(tag);
  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// For fields that might not be encrypted yet (migration safety)
// Phone numbers and emails never contain two colons in sequence like iv:tag:cipher
export function safeDecrypt(data: string | null): string | null {
  if (!data) return null;
  if (!data.includes(':')) return data;
  try {
    return decrypt(data);
  } catch {
    return data;
  }
}

// --- Page tokens for anti-scraping ---

const TOKEN_TTL = 5 * 60 * 1000; // 5 minutes

function getTokenSecret(): string {
  return process.env.NEXTAUTH_SECRET || 'dev-fallback';
}

export function generatePageToken(profileId: string): string {
  const timestamp = Date.now().toString();
  const hmac = crypto.createHmac('sha256', getTokenSecret())
    .update(`${profileId}:${timestamp}`)
    .digest('hex')
    .slice(0, 16);
  return `${timestamp}.${hmac}`;
}

export function validatePageToken(token: string, profileId: string): boolean {
  const [timestamp, hmac] = token.split('.');
  if (!timestamp || !hmac) return false;

  const age = Date.now() - parseInt(timestamp);
  if (age > TOKEN_TTL || age < 0) return false;

  const expected = crypto.createHmac('sha256', getTokenSecret())
    .update(`${profileId}:${timestamp}`)
    .digest('hex')
    .slice(0, 16);

  return hmac === expected;
}
