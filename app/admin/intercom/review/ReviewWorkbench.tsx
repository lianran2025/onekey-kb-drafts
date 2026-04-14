'use client';

import { useEffect, useMemo, useState } from 'react';

type ReviewStatus = 'pending' | 'needs_update' | 'no_change_needed' | 'archived';

type ReviewItem = {
  articleId: string;
  title?: string;
  collectionId?: string;
  collectionPathLabel?: string;
  collectionName?: string;
  updatedAt?: string;
  state?: string;
  publicUrl?: string;
  reviewStatus: ReviewStatus;
  reviewNote: string;
  lastReviewedAt?: string;
  archivedAt?: string;
};

type LoadedArticle = {
  id: string;
  title: string;
  body: string;
  html: string;
  state: string;
  collectionId: string;
};

const STATUS_OPTIONS: Array<{ value: ReviewStatus; label: string }> = [
  { value: 'pending', label: '待检查' },
  { value: 'needs_update', label: '待修改' },
  { value: 'no_change_needed', label: '无需修改' },
  { value: 'archived', label: '已归档' },
];

function formatDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('zh-CN');
}

export function ReviewWorkbench() {
  const [articleId, setArticleId] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [staleDays, setStaleDays] = useState('90');
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [article, setArticle] = useState<LoadedArticle | null>(null);
  const [selectedItem, setSelectedItem] = useState<ReviewItem | null>(null);
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>('pending');
  const [reviewNote, setReviewNote] = useState('');
  const [status, setStatus] = useState('');
  const [loadingList, setLoadingList] = useState(false);
  const [loadingArticle, setLoadingArticle] = useState(false);
  const [saving, setSaving] = useState(false);

  const filteredItems = useMemo(() => items, [items]);

  const loadList = async (params?: { status?: string; query?: string; staleDays?: string }) => {
    setLoadingList(true);
    try {
      const search = new URLSearchParams();
      const nextStatus = params?.status ?? statusFilter;
      const nextQuery = params?.query ?? query;
      const nextStaleDays = params?.staleDays ?? staleDays;
      if (nextStatus) search.set('status', nextStatus);
      if (nextQuery.trim()) search.set('query', nextQuery.trim());
      if (nextStaleDays) search.set('staleDays', nextStaleDays);
      const res = await fetch(`/api/admin/intercom/review?${search.toString()}`, { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || '读取巡检列表失败');
      setItems(data.items || []);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '读取巡检列表失败');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadArticle = async (targetArticleId?: string) => {
    const nextArticleId = (targetArticleId ?? articleId).trim();
    if (!nextArticleId) {
      setStatus('请输入文章 ID');
      return;
    }

    setLoadingArticle(true);
    setStatus('');
    try {
      const [articleRes, reviewRes] = await Promise.all([
        fetch(`/api/admin/intercom/articles/${encodeURIComponent(nextArticleId)}?locale=zh-CN`, { cache: 'no-store' }),
        fetch(`/api/admin/intercom/review?status=&query=${encodeURIComponent(nextArticleId)}`, { cache: 'no-store' }),
      ]);
      const articleData = await articleRes.json().catch(() => ({}));
      const reviewData = await reviewRes.json().catch(() => ({}));
      if (!articleRes.ok) throw new Error(articleData?.error || '读取文章失败');

      const loadedArticle = articleData.article as LoadedArticle;
      const matched = ((reviewData.items || []) as ReviewItem[]).find((item) => item.articleId === nextArticleId) || null;

      setArticleId(nextArticleId);
      setArticle(loadedArticle);
      setSelectedItem(matched);
      setReviewStatus(matched?.reviewStatus || 'pending');
      setReviewNote(matched?.reviewNote || '');
      setStatus('文章已读取');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '读取文章失败');
    } finally {
      setLoadingArticle(false);
    }
  };

  const openFromList = async (item: ReviewItem) => {
    setArticleId(item.articleId);
    await loadArticle(item.articleId);
  };

  const saveReview = async () => {
    if (!articleId.trim()) {
      setStatus('请先读取文章');
      return;
    }

    setSaving(true);
    setStatus('');
    try {
      const res = await fetch('/api/admin/intercom/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId: articleId.trim(),
          reviewStatus,
          reviewNote,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || '保存失败');
      setSelectedItem(data.record || null);
      setStatus('巡检结果已保存');
      await loadList();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="review-workbench">
      <div className="review-grid">
        <aside className="review-sidebar">
          <div className="review-controls">
            <div className="review-toolbar">
              <input
                className="publish-select"
                placeholder="输入 Intercom 文章 ID"
                value={articleId}
                onChange={(e) => setArticleId(e.target.value)}
              />
              <button className="btn" type="button" onClick={() => loadArticle()} disabled={loadingArticle}>
                {loadingArticle ? '读取中...' : '读取文章'}
              </button>
            </div>

            <div className="review-toolbar compact review-toolbar-triple">
              <select
                className="publish-select"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  loadList({ status: e.target.value });
                }}
              >
                <option value="">主列表（排除已归档）</option>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                className="publish-select"
                value={staleDays}
                onChange={(e) => {
                  setStaleDays(e.target.value);
                  loadList({ staleDays: e.target.value });
                }}
              >
                <option value="30">30 天以上未更新</option>
                <option value="90">3 个月以上未更新</option>
                <option value="180">6 个月以上未更新</option>
                <option value="365">1 年以上未更新</option>
                <option value="">全部文章</option>
              </select>

              <input
                className="publish-select"
                placeholder="搜索标题 / 文章 ID / 备注"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') loadList({ query: e.currentTarget.value });
                }}
              />
            </div>
          </div>

          <div className="review-list-head">
            <strong>巡检列表</strong>
            <span className="muted">按最后更新时间排序（越旧越靠前）</span>
          </div>

          <div className="review-list">
            {loadingList ? <p className="muted">加载中...</p> : null}
            {!loadingList && filteredItems.length === 0 ? <p className="muted">暂无记录。</p> : null}
            {filteredItems.map((item) => (
              <button
                key={item.articleId}
                type="button"
                className={`review-item ${selectedItem?.articleId === item.articleId ? 'active' : ''}`}
                onClick={() => openFromList(item)}
              >
                <div className="review-item-main">
                  <div className="admin-list-title">{item.title || `文章 ${item.articleId}`}</div>
                  <div className="review-item-meta">
                    <span className="badge">{item.articleId}</span>
                    {item.collectionPathLabel ? <span className="badge">{item.collectionPathLabel}</span> : null}
                    <span className="badge">{STATUS_OPTIONS.find((option) => option.value === item.reviewStatus)?.label}</span>
                  </div>
                  <p className="muted review-item-dates">
                    更新：{formatDate(item.updatedAt)} ｜ 检查：{formatDate(item.lastReviewedAt)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="review-detail">
          {article ? (
            <div className="review-detail-stack">
              <div className="surface-card review-card review-summary-card">
                <div className="review-detail-head">
                  <div>
                    <h2 className="review-detail-title">{article.title}</h2>
                    <p className="muted">文章 ID：{article.id}</p>
                  </div>
                  <div className="review-detail-links">
                    {selectedItem?.publicUrl ? (
                      <a className="btn btn-ghost btn-small" href={selectedItem.publicUrl} target="_blank" rel="noreferrer">
                        打开公网文章
                      </a>
                    ) : null}
                  </div>
                </div>

                <div className="review-meta-grid">
                  <div>
                    <div className="meta-label">当前状态</div>
                    <div className="meta-value">{STATUS_OPTIONS.find((option) => option.value === (selectedItem?.reviewStatus || 'pending'))?.label}</div>
                  </div>
                  <div>
                    <div className="meta-label">最近检查时间</div>
                    <div className="meta-value">{formatDate(selectedItem?.lastReviewedAt)}</div>
                  </div>
                </div>
              </div>

              <div className="review-editor-grid">
                <div className="surface-card review-card review-form-card">
                  <div className="review-form-grid">
                    <div>
                      <label className="meta-label">巡检结论</label>
                      <select className="publish-select" value={reviewStatus} onChange={(e) => setReviewStatus(e.target.value as ReviewStatus)}>
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="review-note-wrap">
                    <label className="meta-label">备注</label>
                    <textarea
                      className="intercom-textarea"
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                      placeholder="记录本轮检查结论，例如：暂不修改 / 等产品确认后统一处理 / 已发现旧固件表述"
                    />
                  </div>

                  <div className="row">
                    <button className="btn" type="button" onClick={saveReview} disabled={saving}>
                      {saving ? '保存中...' : '保存巡检结果'}
                    </button>
                  </div>
                </div>

                <div className="surface-card review-card review-content-card">
                  <div className="article article-prose review-article-prose" dangerouslySetInnerHTML={{ __html: article.html }} />
                </div>
              </div>
            </div>
          ) : null}

          {status ? <p className="muted review-status-text">{status}</p> : null}
        </section>
      </div>
    </div>
  );
}
