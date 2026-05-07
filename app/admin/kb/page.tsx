import Link from 'next/link';
import { requireSessionEmail } from '@/lib/simple-auth';
import { getAllSlugs, getArticle } from '@/lib/kb';

export const dynamic = 'force-dynamic';

export default async function AdminKbPage() {
  await requireSessionEmail();

  const slugs = getAllSlugs();
  const articles = slugs
    .map((slug) => {
      const article = getArticle(slug);
      return {
        slug,
        title: article.frontmatter.title,
        description: article.frontmatter.description || '',
        createdAt: article.frontmatter.createdAt || '',
      };
    })
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '') || a.title.localeCompare(b.title, 'zh-CN'));

  return (
    <div className="article-page-shell">
      <header className="article-topbar compact-topbar">
        <div className="article-hero-header compact-hero-header">
          <div className="article-hero-copy">
            <h1 className="article-display-title">文章管理</h1>
            <p className="muted">查看本地 KB 草稿文章，并进入详情页继续预览、发布或删除。</p>
          </div>
        </div>
      </header>

      <section className="surface-card compact-surface">
        <div className="simple-article-list">
          {articles.length === 0 ? <p className="muted">暂无文章。</p> : null}
          {articles.map((article) => (
            <Link key={article.slug} href={`/admin/kb/${article.slug}`} className="simple-article-item">
              <div className="simple-article-main">
                <strong>{article.title}</strong>
                <p className="muted">{article.description || article.slug}</p>
                <p className="muted">{article.createdAt ? `创建时间：${article.createdAt}` : `slug：${article.slug}`}</p>
              </div>
              <span className="badge">进入</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
