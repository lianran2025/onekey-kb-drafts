import { auth } from '@/auth';
import { getArticle } from '@/lib/kb';
import { redirect } from 'next/navigation';
import { CopyButtons } from '@/app/kb/[slug]/CopyButtons';
import { DeleteButton } from './DeleteButton';
import { PublishPanel } from './PublishPanel';

export const dynamic = 'force-dynamic';

export default async function AdminArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  if (!session) redirect('/login');

  const { slug } = await params;
  const article = getArticle(slug);

  return (
    <div className="page-stack">
      <section className="hero-card article-hero">
        <div>
          <span className="eyebrow">Admin Editor</span>
          <h1 className="hero-title">{article.frontmatter.title}</h1>
          <p className="hero-subtitle">在这里复制文章、选择 Intercom collection、发布文章或执行删除。</p>
        </div>
        <div className="row">
          <a className="btn btn-ghost" href="/admin">返回后台</a>
          <a className="btn btn-ghost" href={`/kb/${slug}`} target="_blank" rel="noreferrer">
            查看公开页
          </a>
        </div>
      </section>

      <section className="surface-card">
        <div className="section-head">
          <div>
            <h2 className="section-title">管理操作</h2>
            <p className="muted">先选择目标 collection，再发布到 Intercom。</p>
          </div>
        </div>

        <div className="admin-actions">
          <CopyButtons articleSelector="#article" />
          <DeleteButton slug={slug} />
        </div>

        <PublishPanel slug={slug} />
      </section>

      <section className="surface-card">
        <div className="section-head">
          <div>
            <h2 className="section-title">文章预览</h2>
            <p className="muted">下方为当前文章的渲染结果。</p>
          </div>
        </div>

        <section id="article" className="article article-shell">
          <div dangerouslySetInnerHTML={{ __html: article.html }} />
        </section>
      </section>
    </div>
  );
}
