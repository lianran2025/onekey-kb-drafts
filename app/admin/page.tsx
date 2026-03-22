import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import { getAllSlugs, getArticle } from '@/lib/kb';
import { BulkDeletePanel } from './BulkDeletePanel';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await auth();
  if (!session) redirect('/login');

  const slugs = getAllSlugs();
  const items = slugs.map((slug) => {
    const article = getArticle(slug);
    return {
      slug,
      title: article.frontmatter.title,
      description: article.frontmatter.description || '',
    };
  });

  return (
    <div className="article-page-shell">
      <header className="article-topbar">
        <div className="article-breadcrumbs">
          <a href="/">Articles</a>
          <span>›</span>
          <span className="active">Backend</span>
        </div>

        <div className="article-hero-header">
          <div className="article-hero-copy">
            <span className="homepage-eyebrow">Admin Console</span>
            <h1 className="article-display-title">知识库后台管理</h1>
            <p className="homepage-subtitle">
              Manage draft articles, remove content in batches, and open single article pages for Intercom publishing.
            </p>
          </div>
          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/' });
            }}
          >
            <button className="btn" type="submit">退出登录</button>
          </form>
        </div>
      </header>

      <div className="article-layout-grid">
        <aside className="article-side-panel glass-card">
          <section className="article-side-section">
            <h3 className="article-side-title">Workspace Stats</h3>
            <div className="meta-block">
              <p className="meta-label">Articles</p>
              <p className="meta-value">{items.length}</p>
            </div>
            <div className="row">
              <span className="badge">GitHub Synced</span>
              <span className="badge">Admin Only</span>
            </div>
          </section>

          <section className="article-side-section meta-card-dark">
            <div className="meta-block">
              <p className="meta-label">Quick Access</p>
              <p className="meta-value">批量删除、进入单篇后台、发布到 Intercom</p>
            </div>
          </section>
        </aside>

        <main className="article-preview-wrap">
          <div className="surface-card">
            <div className="section-head">
              <div>
                <h2 className="section-title">批量管理</h2>
                <p className="muted">勾选文章后可直接批量删除，也可进入单篇后台继续发布操作。</p>
              </div>
              <span className="badge">共 {items.length} 篇</span>
            </div>

            {items.length === 0 ? (
              <p className="muted">暂无文章。</p>
            ) : (
              <BulkDeletePanel items={items.map(({ slug, title }) => ({ slug, title }))} />
            )}
          </div>

          {items.length > 0 ? (
            <div className="surface-card admin-summary-card">
              <div className="section-head">
                <div>
                  <h2 className="section-title">摘要预览</h2>
                  <p className="muted">快速浏览文章标题和摘要。</p>
                </div>
              </div>
              <div className="list-simple">
                {items.map((it) => (
                  <article key={it.slug} className="list-simple-item admin-summary-item">
                    <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <a href={`/admin/kb/${it.slug}`} className="admin-list-title">{it.title}</a>
                      <span className="badge">{it.slug}</span>
                    </div>
                    {it.description ? <p className="muted">{it.description}</p> : null}
                  </article>
                ))}
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
