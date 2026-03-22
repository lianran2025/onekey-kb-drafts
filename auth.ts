import NextAuth from 'next-auth';
import Resend from 'next-auth/providers/resend';
import { isAllowedEmail } from '@/lib/auth-guard';

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
      return isAllowedEmail(user.email);
    },
    async session({ session, token }) {
      if (session.user) {
        if (typeof token.name === 'string') session.user.name = token.name;
        if (typeof token.email === 'string') session.user.email = token.email;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        token.email = user.email;
      }
      return token;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isAuthRoute = nextUrl.pathname.startsWith('/api/auth');
      const isLoginPage = nextUrl.pathname === '/login';
      if (isAuthRoute || isLoginPage) return true;
      return isAllowedEmail(auth?.user?.email);
    },
  },
  trustHost: true,
});
