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
    <div className="homepage-shell">
      <section className="homepage-hero">
        <div className="homepage-hero-copy">
          <span className="homepage-eyebrow">Digital Curator</span>
          <h1 className="homepage-title">Draft Articles</h1>
          <p className="homepage-subtitle">
            Manage your upcoming knowledge base entries. Refine technical documentation and streamline
            the publication workflow for the OneKey ecosystem.
          </p>
        </div>
      </section>

      <section className="homepage-grid-wrap">
        {items.length === 0 ? (
          <div className="surface-card">
            <p className="muted">暂无文章。你可以先放一个 markdown 到 content/kb/*.md</p>
          </div>
        ) : (
          <div className="homepage-grid">
            {items.map((it, index) => (
              <article key={it.slug} className="homepage-card glass-card">
                <div className="homepage-card-body">
                  <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className="homepage-card-index">{String(index + 1).padStart(2, '0')}</span>
                    {it.tags.length > 0 ? <span className="tag-chip">{it.tags[0]}</span> : null}
                  </div>

                  <a href={`/kb/${it.slug}`} className="homepage-card-title">
                    {it.title}
                  </a>

                  {it.description ? <p className="homepage-card-desc">{it.description}</p> : null}
                </div>

                <div className="homepage-card-footer">
                  <a className="homepage-card-link" href={`/kb/${it.slug}`}>
                    <span>View Article</span>
                    <span aria-hidden="true">→</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
