'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

export function BulkDeletePanel({
  items,
}: {
  items: Array<{ slug: string; title: string }>;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const allSelected = items.length > 0 && selected.length === items.length;

  const toggleOne = (slug: string) => {
    setSelected((current) =>
      current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]
    );
  };

  const toggleAll = () => {
    setSelected((current) => (current.length === items.length ? [] : items.map((item) => item.slug)));
  };

  const onDelete = async () => {
    if (selected.length === 0) {
      setStatus('请先选择要删除的文章');
      return;
    }

    const confirmed = window.confirm(`确认删除选中的 ${selected.length} 篇文章吗？删除后将无法恢复。`);
    if (!confirmed) return;

    setLoading(true);
    setStatus('');

    try {
      const res = await fetch('/api/admin/kb/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slugs: selected }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || '批量删除失败');
      setSelected([]);
      setStatus(data?.message || '删除成功');
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '批量删除失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bulk-panel">
      <div className="bulk-toolbar">
        <label className="checkbox-row">
          <input type="checkbox" checked={allSelected} onChange={toggleAll} />
          <span>全选</span>
        </label>
        <div className="row">
          <span className="muted">已选 {selected.length} 篇</span>
          <button className="btn btn-danger" onClick={onDelete} disabled={loading || selected.length === 0}>
            {loading ? '删除中...' : '删除选中'}
          </button>
        </div>
      </div>

      <div className="admin-list-grid">
        {items.map((item) => (
          <label key={item.slug} className={`admin-list-card ${selectedSet.has(item.slug) ? 'selected' : ''}`}>
            <div className="checkbox-row checkbox-top">
              <input
                type="checkbox"
                checked={selectedSet.has(item.slug)}
                onChange={() => toggleOne(item.slug)}
              />
              <span className="badge">{item.slug}</span>
            </div>
            <a href={`/admin/kb/${item.slug}`} className="admin-list-title">
              {item.title}
            </a>
            <div className="row">
              <a className="text-link" href={`/admin/kb/${item.slug}`}>进入后台</a>
              <a className="text-link muted" href={`/kb/${item.slug}`} target="_blank" rel="noreferrer">
                公开预览
              </a>
            </div>
          </label>
        ))}
      </div>

      {status ? <div className="inline-status muted">{status}</div> : null}
    </div>
  );
}
