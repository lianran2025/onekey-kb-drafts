import NextAuth from 'next-auth';
import Resend from 'next-auth/providers/resend';

function getAllowedEmails() {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET || 'dev-only-secret-change-in-vercel',
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  providers: [
    Resend({
      from: process.env.EMAIL_FROM || 'OneKey KB <no-reply@example.com>',
    }),
  ],
  pages: {
    signIn: '/login',
    verifyRequest: '/login',
  },
  callbacks: {
    async signIn({ user }) {
      const allowedEmails = getAllowedEmails();
      if (allowedEmails.length === 0) return false;
      const email = String(user.email || '').toLowerCase();
      return allowedEmails.includes(email);
    },
    async session({ session, token }) {
      if (session.user) {
        if (typeof token.name === 'string') session.user.name = token.name;
        if (typeof token.email === 'string') session.user.email = token.email;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isAuthRoute = nextUrl.pathname.startsWith('/api/auth');
      const isLoginPage = nextUrl.pathname === '/login';
      if (isAuthRoute) return true;
      if (isLoginPage) return true;
      return !!auth;
    },
  },
  trustHost: true,
});
