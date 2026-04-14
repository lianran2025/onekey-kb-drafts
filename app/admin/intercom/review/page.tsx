import { requireSessionEmail } from '@/lib/simple-auth';
import { ReviewWorkbench } from './ReviewWorkbench';

export const dynamic = 'force-dynamic';

export default async function AdminIntercomReviewPage() {
  await requireSessionEmail();

  return (
    <div className="article-page-shell">
      <header className="article-topbar compact-topbar">
        <div className="article-hero-header compact-hero-header">
          <div className="article-hero-copy">
            <h1 className="article-display-title">Intercom 巡检工作台</h1>
            <p className="muted">按更新时间筛选和复审文章，记录状态、备注，并支持归档与恢复。</p>
          </div>
        </div>
      </header>

      <section className="surface-card compact-surface">
        <ReviewWorkbench />
      </section>
    </div>
  );
}
