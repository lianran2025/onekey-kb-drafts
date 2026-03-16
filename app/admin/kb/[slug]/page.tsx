import { auth } from '@/auth';
import { getArticle } from '@/lib/kb';
import { redirect } from 'next/navigation';
import { CopyButtons } from '@/app/kb/[slug]/CopyButtons';
import { DeleteButton } from './DeleteButton';
import { PublishPanel } from './PublishPanel';

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
    <div className="card">
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="h1">{article.frontmatter.title}</h1>
        <a className="muted" href={`/kb/${slug}`} target="_blank" rel="noreferrer">
          查看公开页
        </a>
      </div>

      <div className="admin-actions">
        <CopyButtons articleSelector="#article" />
        <DeleteButton slug={slug} />
      </div>

      <PublishPanel slug={slug} />

      <hr className="hr" />

      <section id="article" className="article">
        <div dangerouslySetInnerHTML={{ __html: article.html }} />
      </section>
    </div>
  );
}
