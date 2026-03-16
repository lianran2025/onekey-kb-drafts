import { getAllSlugs, getArticle } from '@/lib/kb';
import { CopyButtons } from './CopyButtons';
import { DeleteButton } from './DeleteButton';

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
    <div className="card">
      <h1 className="h1">{title}</h1>

      <CopyButtons articleSelector="#article" />
      <DeleteButton slug={slug} />

      <hr className="hr" />

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
