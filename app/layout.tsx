import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OneKey KB Draft Pages',
  description: 'Draft knowledge base pages (copy/paste into Intercom).',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="container">
          <header className="header">
            <a className="brand" href="/">OneKey KB Draft Pages</a>
            <nav className="nav">
              <a href="/kb">文章列表</a>
            </nav>
          </header>
          <main className="main">{children}</main>
          <footer className="footer">
            <span>Generated drafts for manual copy into Intercom.</span>
          </footer>
        </div>
      </body>
    </html>
  );
}
