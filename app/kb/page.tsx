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
      createdAt: a.frontmatter.createdAt,
    };
  });

  return (
    <div className="card">
      <h1 className="h1">文章列表</h1>
      <p className="muted">每篇文章都是一个独立页面，打开后可复制整篇内容。</p>
      <hr className="hr" />

      {items.length === 0 ? (
        <p className="muted">暂无文章。你可以先放一个 markdown 到 content/kb/*.md</p>
      ) : (
        <ol>
          {items.map((it) => (
            <li key={it.slug} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', flexWrap: 'wrap' }}>
                <a href={`/kb/${it.slug}`} style={{ fontWeight: 700 }}>
                  {it.title}
                </a>
                {it.createdAt ? <span className="badge">{it.createdAt}</span> : null}
              </div>
              {it.description ? <div className="muted">{it.description}</div> : null}
              <div className="muted" style={{ fontSize: 12 }}>
                /kb/{it.slug}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
