import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import { getAllSlugs, getArticle } from '@/lib/kb';

export default async function AdminPage() {
  const session = await auth();
  if (!session) redirect('/login');

  const slugs = getAllSlugs();
  const items = slugs.map((slug) => {
    const article = getArticle(slug);
    return {
      slug,
      title: article.frontmatter.title,
      description: article.frontmatter.description,
    };
  });

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="h1">后台管理</h1>
          <p className="muted">仅白名单账号可见。可在后台执行发布与删除等敏感操作。</p>
        </div>
        <form
          action={async () => {
            'use server';
            await signOut({ redirectTo: '/' });
          }}
        >
          <button className="btn" type="submit">退出登录</button>
        </form>
      </div>

      <hr className="hr" />

      {items.length === 0 ? (
        <p className="muted">暂无文章。</p>
      ) : (
        <ol>
          {items.map((it) => (
            <li key={it.slug} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', flexWrap: 'wrap' }}>
                <a href={`/admin/kb/${it.slug}`} style={{ fontWeight: 700 }}>
                  {it.title}
                </a>
                <a className="muted" href={`/kb/${it.slug}`} target="_blank" rel="noreferrer">
                  公开预览
                </a>
              </div>
              {it.description ? <div className="muted">{it.description}</div> : null}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
