import { getArticle } from '@/lib/kb';
import { CopyButtons } from '@/app/kb/[slug]/CopyButtons';
import { DeleteButton } from './DeleteButton';
import { PublishPanel } from './PublishPanel';
import { requireSessionEmail } from '@/lib/simple-auth';

export const dynamic = 'force-dynamic';

export default async function AdminArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireSessionEmail();

  const { slug } = await params;
  const article = getArticle(slug);

  return (
    <div className="article-page-shell">
      <main className="article-preview-wrap article-preview-centered">
        <div className="article-paper admin-article-paper article-paper-narrow">
          <div className="article-paper-head article-paper-head-minimal">
            <h1 className="article-paper-title">{article.frontmatter.title}</h1>
          </div>

          <section id="article" className="article article-prose">
            <div dangerouslySetInnerHTML={{ __html: article.html }} />
          </section>
        </div>

        <section className="surface-card article-tools-below article-tools-below-compact">
          <div className="article-tools-stack article-tools-stack-compact">
            <div className="tool-button-row">
              <CopyButtons articleSelector="#article" />
              <DeleteButton slug={slug} />
            </div>
            <PublishPanel slug={slug} />
          </div>
        </section>
      </main>
    </div>
  );
}
