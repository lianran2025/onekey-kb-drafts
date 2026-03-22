import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import { getAllSlugs, getArticle } from '@/lib/kb';
import { BulkDeletePanel } from './BulkDeletePanel';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await auth();
  if (!session) redirect('/login');

  const slugs = getAllSlugs();
  const items = slugs.map((slug) => {
    const article = getArticle(slug);
    return {
      slug,
      title: article.frontmatter.title,
      description: article.frontmatter.description || '',
    };
  });

  return (
    <div className="page-stack">
      <section className="hero-card">
        <div>
          <span className="eyebrow">Admin Console</span>
          <h1 className="hero-title">知识库后台管理</h1>
          <p className="hero-subtitle">统一管理文章草稿、批量删除、进入单篇页面发布到 Intercom。</p>
        </div>
        <form
          action={async () => {
            'use server';
            await signOut({ redirectTo: '/' });
          }}
        >
          <button className="btn" type="submit">退出登录</button>
        </form>
      </section>

      <section className="surface-card">
        <div className="section-head">
          <div>
            <h2 className="section-title">文章列表</h2>
            <p className="muted">支持多选删除，也可以进入单篇管理页面进行发布。</p>
          </div>
          <span className="badge">共 {items.length} 篇</span>
        </div>

        {items.length === 0 ? (
          <p className="muted">暂无文章。</p>
        ) : (
          <BulkDeletePanel items={items.map(({ slug, title }) => ({ slug, title }))} />
        )}
      </section>

      {items.length > 0 ? (
        <section className="surface-card">
          <div className="section-head">
            <div>
              <h2 className="section-title">文章摘要</h2>
              <p className="muted">快速浏览每篇文章的摘要说明。</p>
            </div>
          </div>
          <div className="list-simple">
            {items.map((it) => (
              <article key={it.slug} className="list-simple-item">
                <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <a href={`/admin/kb/${it.slug}`} className="admin-list-title">{it.title}</a>
                  <span className="badge">{it.slug}</span>
                </div>
                {it.description ? <p className="muted">{it.description}</p> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
