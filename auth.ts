import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';

function getAllowedUsers() {
  return (process.env.ADMIN_GITHUB_USERS || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET || 'dev-only-secret-change-in-vercel',
  providers: [GitHub],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ profile }) {
      const allowedUsers = getAllowedUsers();
      if (allowedUsers.length === 0) return false;

      const login = String((profile as { login?: string } | undefined)?.login || '').toLowerCase();
      return allowedUsers.includes(login);
    },
    async session({ session, token }) {
      if (session.user) {
        if (typeof token.name === 'string') {
          session.user.name = token.name;
        }
        if (typeof token.email === 'string') {
          session.user.email = token.email;
        }
        (session.user as { login?: string }).login =
          typeof token.login === 'string' ? token.login : undefined;
      }
      return session;
    },
    async jwt({ token, profile }) {
      if (profile) {
        token.login = (profile as { login?: string }).login;
      }
      return token;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isAdminPath = nextUrl.pathname.startsWith('/admin') || nextUrl.pathname.startsWith('/api/admin');
      if (!isAdminPath) return true;
      return !!auth;
    },
  },
  trustHost: true,
});
