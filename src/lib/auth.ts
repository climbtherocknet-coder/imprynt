import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { query } from '@/lib/db';

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          console.log('[auth] authorize called, email:', credentials?.email);

          if (!credentials?.email || !credentials?.password) {
            console.log('[auth] missing credentials');
            return null;
          }

          const email = credentials.email as string;
          const password = credentials.password as string;

          console.log('[auth] querying DB for:', email);
          const result = await query(
            'SELECT id, email, password_hash, first_name, last_name, plan, setup_completed, account_status FROM users WHERE email = $1',
            [email]
          );

          if (result.rows.length === 0) {
            console.log('[auth] user not found');
            return null;
          }

          const user = result.rows[0];
          console.log('[auth] user found, status:', user.account_status, 'hash length:', user.password_hash?.length);

          // Block suspended accounts
          if (user.account_status === 'suspended') {
            throw new Error('Your account has been suspended. Contact support.');
          }

          console.log('[auth] comparing password, len:', password.length, 'first3:', password.substring(0, 3), 'hash:', user.password_hash.substring(0, 20));
          const passwordMatch = await compare(password, user.password_hash);
          console.log('[auth] password match:', passwordMatch);

          if (!passwordMatch) {
            return null;
          }

          console.log('[auth] login success for:', email);
          return {
            id: user.id,
            email: user.email,
            name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || null,
            plan: user.plan,
            setupCompleted: user.setup_completed,
          };
        } catch (err) {
          console.log('[auth] authorize error:', err instanceof Error ? err.message : err);
          throw err;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    newUser: '/dashboard/setup',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.plan = (user as Record<string, unknown>).plan;
        token.setupCompleted = (user as Record<string, unknown>).setupCompleted;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as unknown as Record<string, unknown>).plan = token.plan;
        (session.user as unknown as Record<string, unknown>).setupCompleted = token.setupCompleted;
      }
      return session;
    },
  },
});
