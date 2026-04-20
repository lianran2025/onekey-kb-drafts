'use client';

import { useEffect, useMemo, useState } from 'react';

type ReviewStatus = 'pending' | 'needs_update' | 'no_change_needed' | 'archived';

type ReviewItem = {
  articleId: string;
  title?: string;
  collectionId?: string;
  collectionPathLabel?: string;
  updatedAt?: string;
  state?: string;
  publicUrl?: string;
  reviewStatus: ReviewStatus;
  reviewNote: string;
  lastReviewedAt?: string;
  archivedAt?: string;
};

type DraftReviewMap = Record<
  string,
  {
    reviewStatus: ReviewStatus;
    reviewNote: string;
  }
>;

type CollectionOption = {
  value: string;
  label: string;
  parent: string;
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

function parseCollectionPathLabel(label?: string) {
  const raw = String(label || '').trim();
  if (!raw) return { parent: '', child: '' };
  const parts = raw.split('/').map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return {
      parent: parts[0],
      child: parts.slice(1).join(' / '),
    };
  }
  return {
    parent: raw,
    child: raw,
  };
}

export function ReviewWorkbench() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [parentCollectionFilter, setParentCollectionFilter] = useState('');
  const [collectionFilter, setCollectionFilter] = useState('');
  const [staleDays, setStaleDays] = useState('90');
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [drafts, setDrafts] = useState<DraftReviewMap>({});
  const [status, setStatus] = useState('');
  const [loadingList, setLoadingList] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const collectionOptions = useMemo(() => {
    const map = new Map<string, CollectionOption>();
    for (const item of items) {
      if (item.collectionId && item.collectionPathLabel) {
        const parsed = parseCollectionPathLabel(item.collectionPathLabel);
        map.set(item.collectionId, {
          value: item.collectionId,
          label: parsed.child || item.collectionPathLabel,
          parent: parsed.parent || '未分类',
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label, 'zh-CN'));
  }, [items]);

  const parentCollectionOptions = useMemo(() => {
    return Array.from(new Set(collectionOptions.map((item) => item.parent))).sort((a, b) => a.localeCompare(b, 'zh-CN'));
  }, [collectionOptions]);

  const childCollectionOptions = useMemo(() => {
    return collectionOptions.filter((item) => (parentCollectionFilter ? item.parent === parentCollectionFilter : true));
  }, [collectionOptions, parentCollectionFilter]);

  useEffect(() => {
    if (collectionFilter && !childCollectionOptions.some((item) => item.value === collectionFilter)) {
      setCollectionFilter('');
    }
  }, [collectionFilter, childCollectionOptions]);

  useEffect(() => {
    if (parentCollectionFilter && !collectionOptions.some((item) => item.parent === parentCollectionFilter)) {
      setParentCollectionFilter('');
    }
  }, [parentCollectionFilter, collectionOptions]);

  const loadList = async (params?: { status?: string; query?: string; staleDays?: string; collectionId?: string }) => {
    setLoadingList(true);
    try {
      const search = new URLSearchParams();
      const nextStatus = params?.status ?? statusFilter;
      const nextQuery = params?.query ?? query;
      const nextStaleDays = params?.staleDays ?? staleDays;
      const nextCollectionId = params?.collectionId ?? collectionFilter;
      if (nextStatus) search.set('status', nextStatus);
      if (nextQuery.trim()) search.set('query', nextQuery.trim());
      if (nextStaleDays) search.set('staleDays', nextStaleDays);
      if (nextCollectionId) search.set('collectionId', nextCollectionId);
      const res = await fetch(`/api/admin/intercom/review?${search.toString()}`, { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || '读取巡检列表失败');
      const nextItems = data.items || [];
      setItems(nextItems);
      setDrafts(
        Object.fromEntries(
          nextItems.map((item: ReviewItem) => [
            item.articleId,
            {
              reviewStatus: item.reviewStatus,
              reviewNote: item.reviewNote || '',
            },
          ])
        )
      );
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

  const syncArticles = async () => {
    setSyncing(true);
    setStatus('');
    try {
      const res = await fetch('/api/admin/intercom/review/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || '同步失败');
      setStatus(data?.message || '同步成功');
      await loadList();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '同步失败');
    } finally {
      setSyncing(false);
    }
  };

  const openArticle = (item: ReviewItem) => {
    if (item.publicUrl) {
      window.open(item.publicUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    setStatus(`这篇文章暂时没有可用的公开链接：${item.articleId}`);
  };

  const updateDraft = (articleId: string, patch: Partial<{ reviewStatus: ReviewStatus; reviewNote: string }>) => {
    setDrafts((current) => ({
      ...current,
      [articleId]: {
        reviewStatus: patch.reviewStatus ?? current[articleId]?.reviewStatus ?? 'pending',
        reviewNote: patch.reviewNote ?? current[articleId]?.reviewNote ?? '',
      },
    }));
  };

  const saveReview = async (articleId: string) => {
    const draft = drafts[articleId];
    if (!draft) return;
    setSavingId(articleId);
    setStatus('');
    try {
      const res = await fetch('/api/admin/intercom/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          reviewStatus: draft.reviewStatus,
          reviewNote: draft.reviewNote,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || '保存失败');
      setStatus(`已保存：${articleId}`);
      await loadList();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '保存失败');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="review-workbench-simple">
      <div className="review-toolbar-simple review-toolbar-simple-extended-two-level">
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

        <select
          className="publish-select"
          value={statusFilter}
          onChange={(e) => {
            const nextStatus = e.target.value;
            setStatusFilter(nextStatus);
            setCollectionFilter('');
            loadList({ status: nextStatus, collectionId: '' });
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
          value={parentCollectionFilter}
          onChange={(e) => {
            const nextParent = e.target.value;
            setParentCollectionFilter(nextParent);
            setCollectionFilter('');
          }}
        >
          <option value="">全部一级分类</option>
          {parentCollectionOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          className="publish-select"
          value={collectionFilter}
          onChange={(e) => {
            setCollectionFilter(e.target.value);
            loadList({ collectionId: e.target.value });
          }}
        >
          <option value="">全部二级 collection</option>
          {childCollectionOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <input
          className="publish-select"
          placeholder="搜索标题 / 文章 ID"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') loadList({ query: e.currentTarget.value });
          }}
        />

        <button className="btn btn-small btn-ghost" type="button" onClick={syncArticles} disabled={syncing}>
          {syncing ? '同步中...' : '同步 Intercom 文章'}
        </button>
      </div>

      {status ? <p className="muted review-status-text">{status}</p> : null}

      <div className="review-list-simple">
        {loadingList ? <p className="muted">加载中...</p> : null}
        {!loadingList && items.length === 0 ? <p className="muted">暂无文章。</p> : null}
        {items.map((item) => {
          const draft = drafts[item.articleId] || {
            reviewStatus: item.reviewStatus,
            reviewNote: item.reviewNote || '',
          };
          return (
            <div key={item.articleId} className="review-item-row surface-card">
              <button type="button" className="review-item review-item-open" onClick={() => openArticle(item)}>
                <div className="review-item-main review-item-main-wide">
                  <div className="admin-list-title">{item.title || `文章 ${item.articleId}`}</div>
                  <div className="review-item-meta">
                    <span className="badge">{item.articleId}</span>
                    {item.collectionPathLabel ? <span className="badge">{item.collectionPathLabel}</span> : null}
                    <span className="badge">更新：{formatDate(item.updatedAt)}</span>
                  </div>
                </div>
              </button>

              <div className="review-inline-controls">
                <select
                  className="publish-select"
                  value={draft.reviewStatus}
                  onChange={(e) => updateDraft(item.articleId, { reviewStatus: e.target.value as ReviewStatus })}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <input
                  className="publish-select"
                  placeholder="备注（可选）"
                  value={draft.reviewNote}
                  onChange={(e) => updateDraft(item.articleId, { reviewNote: e.target.value })}
                />

                <button
                  className="btn btn-small"
                  type="button"
                  onClick={() => saveReview(item.articleId)}
                  disabled={savingId === item.articleId}
                >
                  {savingId === item.articleId ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
