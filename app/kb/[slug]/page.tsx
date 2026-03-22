import { getAllSlugs, getArticle } from '@/lib/kb';
import { CopyButtons } from './CopyButtons';
import { requireSessionEmail } from '@/lib/simple-auth';

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export default async function KbArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireSessionEmail();

  const { slug } = await params;
  const article = getArticle(slug);

  const { title, sources, createdAt } = article.frontmatter;

  return (
    <div className="article-page-shell">
      <header className="article-topbar">
        <div className="article-breadcrumbs">
          <a href="/">Articles</a>
          <span>›</span>
          <span>Drafts</span>
          <span>›</span>
          <span className="active">Article Preview</span>
        </div>

        <div className="article-hero-header">
          <div className="article-hero-copy">
            <span className="homepage-eyebrow">Digital Archive</span>
            <h1 className="article-display-title">{title}</h1>
          </div>
          <div className="row">
            <a className="btn btn-ghost" href="/admin">
              返回后台
            </a>
          </div>
        </div>
      </header>

      <div className="article-layout-grid">
        <aside className="article-side-panel glass-card">
          <section className="article-side-section">
            <h3 className="article-side-title">Asset Controls</h3>
            <div className="article-side-actions">
              <CopyButtons articleSelector="#article" />
              <a className="btn btn-ghost article-side-btn" href={`/admin/kb/${slug}`}>
                进入后台操作
              </a>
            </div>
          </section>

          <section className="article-side-section meta-card-dark">
            <div className="meta-block">
              <p className="meta-label">Last Modified</p>
              <p className="meta-value">{createdAt || '—'}</p>
            </div>
            <div className="row">
              <span className="badge">Preview</span>
              <span className="badge">KB Draft</span>
            </div>
          </section>
        </aside>

        <main className="article-preview-wrap">
          <div className="article-paper">
            <div className="article-paper-head">
              <h1 className="article-paper-title">{title}</h1>
              <div className="article-paper-meta">
                {createdAt ? <span>{createdAt}</span> : null}
                <span>Draft Preview</span>
              </div>
            </div>

            <section id="article" className="article article-prose">
              <div dangerouslySetInnerHTML={{ __html: article.html }} />

              {sources?.length ? (
                <>
                  <hr />
                  <h2>参考来源（用于复核）</h2>
                  <ul>
                    {sources.map((s, idx) => (
                      <li key={`${s.url}-${idx}`}>
                        <a href={s.url} target="_blank" rel="noreferrer">
                          {s.title || s.url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
