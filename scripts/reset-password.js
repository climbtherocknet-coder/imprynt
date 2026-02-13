#!/usr/bin/env node
/**
 * Reset a user's password safely (no shell escaping issues).
 *
 * Usage inside the container:
 *   node scripts/reset-password.js <email> <new-password>
 *
 * From host:
 *   docker exec imprynt-app node scripts/reset-password.js tim@imprynt.io MyNewPassword123
 */

const { hash } = require('bcryptjs');
const { Pool } = require('pg');

async function main() {
  const [,, email, newPassword] = process.argv;

  if (!email || !newPassword) {
    console.error('Usage: node scripts/reset-password.js <email> <new-password>');
    process.exit(1);
  }

  if (newPassword.length < 8) {
    console.error('Password must be at least 8 characters');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    // Verify user exists
    const check = await pool.query('SELECT id, email FROM users WHERE email = $1', [email.toLowerCase()]);
    if (check.rows.length === 0) {
      console.error(`No user found with email: ${email}`);
      process.exit(1);
    }

    // Hash and update
    const passwordHash = await hash(newPassword, 12);
    await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [passwordHash, email.toLowerCase()]);

    console.log(`Password updated for ${check.rows[0].email}`);
  } finally {
    await pool.end();
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
