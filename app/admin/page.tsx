import { getAllSlugs, getArticle } from '@/lib/kb';
import { requireSessionEmail } from '@/lib/simple-auth';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  await requireSessionEmail();

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
      <header className="article-topbar compact-topbar">
        <div className="article-hero-header compact-hero-header">
          <div className="article-hero-copy">
            <h1 className="article-display-title">文章管理</h1>
          </div>
          <a className="btn btn-ghost" href="/admin/intercom">Intercom 修改</a>
        </div>
      </header>

      <section className="surface-card compact-surface">
        {items.length === 0 ? (
          <p className="muted">暂无文章。</p>
        ) : (
          <div className="simple-article-list">
            {items.map((it) => (
              <a key={it.slug} href={`/admin/kb/${it.slug}`} className="simple-article-item">
                <div className="simple-article-main">
                  <div className="admin-list-title">{it.title}</div>
                  {it.description ? <p className="muted">{it.description}</p> : null}
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
