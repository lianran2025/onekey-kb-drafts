import { requireSessionEmail } from '@/lib/simple-auth';

export const dynamic = 'force-dynamic';

const CARDS = [
  {
    title: '文章管理',
    description: '查看和管理本地 KB 草稿文章，进入单篇文章预览、发布和删除操作。',
    href: '/admin',
    disabled: true,
    note: '当前页即文章管理首页',
  },
  {
    title: 'Intercom 修改',
    description: '按文章 ID 读取、修改并保存 Intercom 帮助中心文章内容。',
    href: '/admin/intercom',
  },
  {
    title: '巡检工作台',
    description: '按更新时间巡检 Intercom 文章，记录状态、备注，并支持归档与恢复。',
    href: '/admin/intercom/review',
  },
];

export default async function AdminPage() {
  await requireSessionEmail();

  return (
    <div className="article-page-shell">
      <header className="article-topbar compact-topbar">
        <div className="article-hero-header compact-hero-header">
          <div className="article-hero-copy">
            <h1 className="article-display-title">管理工作台</h1>
            <p className="muted">选择一个工作区域继续操作。</p>
          </div>
        </div>
      </header>

      <section className="admin-feature-grid">
        {CARDS.map((card) =>
          card.disabled ? (
            <div key={card.title} className="surface-card admin-feature-card admin-feature-card-disabled">
              <div className="admin-feature-head">
                <h2 className="admin-feature-title">{card.title}</h2>
                {card.note ? <span className="badge">{card.note}</span> : null}
              </div>
              <p className="muted">{card.description}</p>
            </div>
          ) : (
            <a key={card.title} href={card.href} className="surface-card admin-feature-card">
              <div className="admin-feature-head">
                <h2 className="admin-feature-title">{card.title}</h2>
                <span className="badge">进入</span>
              </div>
              <p className="muted">{card.description}</p>
            </a>
          )
        )}
      </section>
    </div>
  );
}
