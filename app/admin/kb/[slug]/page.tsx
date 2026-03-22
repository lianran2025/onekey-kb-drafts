import { getArticle } from '@/lib/kb';
import { CopyButtons } from '@/app/kb/[slug]/CopyButtons';
import { DeleteButton } from './DeleteButton';
import { PublishPanel } from './PublishPanel';
import { requireAdminSession } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

export default async function AdminArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireAdminSession();

  const { slug } = await params;
  const article = getArticle(slug);

  return (
    <div className="article-page-shell">
      <header className="article-topbar">
        <div className="article-breadcrumbs">
          <a href="/">Articles</a>
          <span>›</span>
          <a href="/admin">Backend</a>
          <span>›</span>
          <span className="active">Article Management</span>
        </div>

        <div className="article-hero-header">
          <div className="article-hero-copy">
            <span className="homepage-eyebrow">Digital Archive ID</span>
            <h1 className="article-display-title">{article.frontmatter.title}</h1>
          </div>
          <div className="row">
            <a className="btn btn-ghost" href="/admin">
              返回后台
            </a>
          </div>
        </div>
      </header>

      <div className="article-layout-grid article-layout-grid-admin">
        <aside className="article-side-panel glass-card admin-side-panel">
          <section className="article-side-section">
            <h3 className="article-side-title">Asset Controls</h3>
            <div className="article-side-actions admin-action-stack">
              <CopyButtons articleSelector="#article" />
              <DeleteButton slug={slug} />
            </div>
          </section>

          <section className="article-side-section intercom-sync-card">
            <h3 className="article-side-title article-side-title-bright">Intercom Sync</h3>
            <PublishPanel slug={slug} />
          </section>

          <section className="article-side-section meta-card-dark">
            <div className="meta-block">
              <p className="meta-label">Current Draft</p>
              <p className="meta-value">{slug}</p>
            </div>
            <div className="row">
              <span className="badge">Admin</span>
              <span className="badge">Preview Ready</span>
            </div>
          </section>
        </aside>

        <main className="article-preview-wrap">
          <div className="article-paper admin-article-paper">
            <div className="article-paper-head">
              <h1 className="article-paper-title">{article.frontmatter.title}</h1>
              <div className="article-paper-meta">
                <span>Admin Preview</span>
                <span>Draft Source</span>
              </div>
            </div>

            <section id="article" className="article article-prose">
              <div dangerouslySetInnerHTML={{ __html: article.html }} />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
