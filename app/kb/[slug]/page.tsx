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

  const { title, sources } = article.frontmatter;

  return (
    <div className="page-stack">
      <section className="hero-card article-hero">
        <div>
          <span className="eyebrow">Article Preview</span>
          <h1 className="hero-title">{title}</h1>
          <p className="hero-subtitle">可在此复制文章内容，或进入后台执行发布、删除等管理操作。</p>
        </div>
        <div className="row">
          <a className="btn btn-ghost" href="/">返回列表</a>
          <a className="btn" href={`/admin/kb/${slug}`}>进入后台</a>
        </div>
      </section>

      <section className="surface-card">
        <div className="section-head">
          <div>
            <h2 className="section-title">文章内容</h2>
            <p className="muted">复制时建议直接使用下方按钮。</p>
          </div>
          <CopyButtons articleSelector="#article" />
        </div>

        <section id="article" className="article article-shell">
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
      </section>
    </div>
  );
}
