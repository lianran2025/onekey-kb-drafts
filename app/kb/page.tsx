import { getAllSlugs, getArticle } from '@/lib/kb';

export const dynamic = 'force-static';

export default function KbIndexPage() {
  const slugs = getAllSlugs();

  const items = slugs.map((slug) => {
    const a = getArticle(slug);
    return {
      slug,
      title: a.frontmatter.title,
      description: a.frontmatter.description,
      tags: a.frontmatter.tags || [],
    };
  });

  return (
    <div className="page-stack">
      <section className="hero-card public-hero">
        <div>
          <span className="eyebrow">OneKey KB Drafts</span>
          <h1 className="hero-title">文章列表</h1>
          <p className="hero-subtitle">查看草稿文章、打开单篇页面，并复制到 Intercom 或进入后台管理。</p>
        </div>
      </section>

      <section className="surface-card">
        {items.length === 0 ? (
          <p className="muted">暂无文章。你可以先放一个 markdown 到 content/kb/*.md</p>
        ) : (
          <div className="kb-grid">
            {items.map((it) => (
              <article key={it.slug} className="kb-card">
                <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <a href={`/kb/${it.slug}`} className="kb-card-title">
                    {it.title}
                  </a>
                  <span className="badge">KB</span>
                </div>
                {it.description ? <p className="kb-card-desc">{it.description}</p> : null}
                {it.tags.length > 0 ? (
                  <div className="tag-list">
                    {it.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="tag-chip">{tag}</span>
                    ))}
                  </div>
                ) : null}
                <div className="row">
                  <a className="text-link" href={`/kb/${it.slug}`}>查看文章</a>
                  <a className="text-link muted" href={`/admin/kb/${it.slug}`}>后台管理</a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
