import { getAllSlugs, getArticle } from '@/lib/kb';
import { CopyButtons } from './CopyButtons';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export default async function KbArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);

  const { title, description, tags, sources, createdAt } = article.frontmatter;

  return (
    <div className="card">
      <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', flexWrap: 'wrap' }}>
        <h1 className="h1" style={{ marginRight: 10 }}>
          {title}
        </h1>
        {createdAt ? <span className="badge">{createdAt}</span> : null}
        {tags?.length ? <span className="badge">{tags.join(' / ')}</span> : null}
      </div>

      {description ? <p className="muted">{description}</p> : null}

      <CopyButtons articleSelector="#article" markdown={article.markdown} />

      <hr className="hr" />

      <div className="muted" style={{ fontSize: 13, marginBottom: 10 }}>
        下面白色区域为“可复制粘贴进 Intercom 的正文”。
      </div>

      <section id="article" className="article">
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
  );
}
