import { getArticle } from '@/lib/kb';
import { CopyButtons } from '@/app/kb/[slug]/CopyButtons';
import { DeleteButton } from './DeleteButton';
import { PublishPanel } from './PublishPanel';
import { requireSessionEmail } from '@/lib/simple-auth';
import { getIntercomPublishHtml } from '@/lib/intercom';

export const dynamic = 'force-dynamic';

export default async function AdminArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireSessionEmail();

  const { slug } = await params;
  const article = getArticle(slug);
  const intercomPreview = getIntercomPublishHtml(article.html);
  const errors = intercomPreview.validation.issues.filter((issue) => issue.level === 'error');
  const warnings = intercomPreview.validation.issues.filter((issue) => issue.level === 'warning');

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

        <section className="article-paper admin-article-paper article-paper-narrow intercom-preview-panel">
          <div className="article-paper-head article-paper-head-minimal">
            <h2 className="article-paper-title article-paper-subtitle">Intercom 发布预览</h2>
            <p className="muted">这里显示发布 API 最终发送给 Intercom 的语义 HTML。</p>
          </div>

          <div className="intercom-validation">
            {errors.length === 0 && warnings.length === 0 ? (
              <span className="badge">校验通过</span>
            ) : null}

            {errors.length > 0 ? (
              <div className="validation-group validation-group-error">
                <strong>需要修复</strong>
                <ul>
                  {errors.map((issue, index) => (
                    <li key={`error-${index}`}>{issue.message}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {warnings.length > 0 ? (
              <div className="validation-group validation-group-warning">
                <strong>建议检查</strong>
                <ul>
                  {warnings.map((issue, index) => (
                    <li key={`warning-${index}`}>{issue.message}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <section className="article article-prose intercom-rendered-preview">
            <div dangerouslySetInnerHTML={{ __html: intercomPreview.html }} />
          </section>
        </section>

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
