import type { Metadata } from 'next';
import './globals.css';
import { auth, signIn, signOut } from '@/auth';

export const metadata: Metadata = {
  title: 'OneKey KB Draft Pages',
  description: 'Draft knowledge base pages (copy/paste into Intercom).',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="zh-CN">
      <body>
        <div className="container">
          <header className="header">
            <a className="brand" href="/">OneKey KB Draft Pages</a>
            <nav className="nav row">
              <a href="/">文章列表</a>
              {session ? <a href="/admin">后台</a> : <a href="/login">登录</a>}
              {session ? (
                <form
                  action={async () => {
                    'use server';
                    await signOut({ redirectTo: '/' });
                  }}
                >
                  <button className="btn btn-small" type="submit">
                    退出
                  </button>
                </form>
              ) : (
                <form
                  action={async () => {
                    'use server';
                    await signIn('github', { redirectTo: '/admin' });
                  }}
                >
                  <button className="btn btn-small" type="submit">
                    GitHub 登录
                  </button>
                </form>
              )}
            </nav>
          </header>
          <main className="main">{children}</main>
          <footer className="footer">
            <span>Public pages are open. Admin actions require GitHub login and allowlist.</span>
          </footer>
        </div>
      </body>
    </html>
  );
}
