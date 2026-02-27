-- 052: Drop abandoned tables identified in cleanup audit (Feb 26, 2026)
--
-- sessions: NextAuth DB session table. App uses JWT strategy, never read or written. 0 rows.
-- verification_tokens: NextAuth adapter table. App uses email_verification_tokens instead. 0 rows.

DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS verification_tokens;
