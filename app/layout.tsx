import type { Metadata } from 'next';
import './globals.css';
import { AuthNav } from './AuthNav';

export const metadata: Metadata = {
  title: 'OneKey KB Draft Pages',
  description: 'Draft knowledge base pages (copy/paste into Intercom).',
};

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="container">
          <header className="header glass-card header-compact">
            <a className="brand" href="/admin">OneKey KB</a>
            <AuthNav />
          </header>
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
