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
      <header className="article-topbar compact-topbar">
        <div className="article-hero-copy article-hero-copy-centered">
          <span className="homepage-eyebrow">Article Management</span>
          <h1 className="article-display-title">{article.frontmatter.title}</h1>
        </div>
      </header>

      <main className="article-preview-wrap article-preview-centered">
        <div className="article-paper admin-article-paper article-paper-narrow">
          <div className="article-paper-head">
            <h1 className="article-paper-title">{article.frontmatter.title}</h1>
          </div>

          <section id="article" className="article article-prose">
            <div dangerouslySetInnerHTML={{ __html: article.html }} />
          </section>
        </div>

        <section className="surface-card article-tools-below">
          <div className="section-head compact-section-head">
            <div>
              <h2 className="section-title">操作</h2>
              <p className="muted">复制正文、选择 collection 并发布到 Intercom。</p>
            </div>
          </div>

          <div className="article-tools-stack">
            <div className="admin-actions compact-admin-actions">
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
