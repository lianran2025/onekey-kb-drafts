import { getAllSlugs, getArticle } from '@/lib/kb';
import { clearSession, requireSessionEmail } from '@/lib/simple-auth';

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
            <span className="homepage-eyebrow">Admin Console</span>
            <h1 className="article-display-title">文章管理</h1>
            <p className="homepage-subtitle">登录后直接管理文章、打开单篇页面并发布到 Intercom。</p>
          </div>
          <form
            action={async () => {
              'use server';
              await clearSession();
            }}
          >
            <button className="btn" type="submit">退出登录</button>
          </form>
        </div>
      </header>

      <section className="surface-card compact-surface">
        <div className="section-head compact-section-head">
          <div>
            <h2 className="section-title">文章列表</h2>
            <p className="muted">点击任意文章即可进入详情页继续操作。</p>
          </div>
          <span className="badge">共 {items.length} 篇</span>
        </div>

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
                <span className="badge">{it.slug}</span>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
