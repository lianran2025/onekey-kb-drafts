import { requireSessionEmail } from '@/lib/simple-auth';
import { IntercomEditor } from './IntercomEditor';

export const dynamic = 'force-dynamic';

export default async function AdminIntercomPage() {
  await requireSessionEmail();

  return (
    <div className="article-page-shell">
      <header className="article-topbar compact-topbar">
        <div className="article-hero-header compact-hero-header">
          <div className="article-hero-copy">
            <h1 className="article-display-title">Intercom 文章修改</h1>
          </div>
        </div>
      </header>

      <section className="surface-card compact-surface">
        <IntercomEditor />
      </section>
    </div>
  );
}
