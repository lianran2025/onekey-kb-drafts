'use client';

import { useEffect, useMemo, useState } from 'react';

type CollectionItem = {
  id: string;
  name: string;
  pathLabel: string;
  parentId?: string | null;
};

export function PublishPanel({ slug }: { slug: string }) {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    let active = true;

    async function loadCollections() {
      setLoadingCollections(true);
      setStatus('');
      try {
        const res = await fetch('/api/admin/intercom/collections', { cache: 'no-store' });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || '读取 collection 失败');
        if (!active) return;
        const items = (data?.collections || []) as CollectionItem[];
        setCollections(items);
      } catch (error) {
        if (!active) return;
        setStatus(error instanceof Error ? error.message : '读取 collection 失败');
      } finally {
        if (active) setLoadingCollections(false);
      }
    }

    loadCollections();
    return () => {
      active = false;
    };
  }, []);

  const getChildren = (parentId: string | null) =>
    collections
      .filter((item) => (item.parentId || null) === parentId)
      .sort((left, right) => left.name.localeCompare(right.name, 'zh-CN'));

  const levels = useMemo(() => {
    const result: Array<{ parentId: string | null; options: CollectionItem[]; selected: string }> = [];
    let parentId: string | null = null;

    for (let index = 0; index < 8; index += 1) {
      const options = getChildren(parentId);
      if (options.length === 0) break;
      const selected = selectedPath[index] || '';
      result.push({ parentId, options, selected });
      if (!selected) break;
      parentId = selected;
    }

    return result;
  }, [collections, selectedPath]);

  const collectionId = selectedPath[selectedPath.length - 1] || '';

  const updateLevel = (index: number, value: string) => {
    setSelectedPath((current) => {
      const next = current.slice(0, index);
      if (value) next.push(value);
      return next;
    });
  };

  const onPublish = async () => {
    if (!collectionId) {
      setStatus('请先选择 collection');
      return;
    }

    setPublishing(true);
    setStatus('');

    try {
      const res = await fetch(`/api/admin/kb/${slug}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collectionId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || '发布失败');
      setStatus(data?.openUrl ? `发布成功：${data.openUrl}` : data?.message || '发布成功');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '发布失败');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="publish-panel publish-panel-rich publish-panel-compact">
      <label className="publish-label">
        <div className="cascade-grid">
          {levels.length === 0 && !loadingCollections ? <div className="muted">未读取到 collection</div> : null}
          {levels.map((level, index) => (
            <select
              key={`${level.parentId ?? 'root'}-${index}`}
              className="publish-select"
              value={level.selected}
              onChange={(event) => updateLevel(index, event.target.value)}
              disabled={loadingCollections || publishing}
            >
              <option value="">请选择第 {index + 1} 级目录</option>
              {level.options.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          ))}
        </div>
      </label>

      {collectionId ? (
        <div className="selected-collection">
          <span className="badge">
            {collections.find((item) => item.id === collectionId)?.pathLabel || collectionId}
          </span>
        </div>
      ) : null}

      <div className="row publish-action-row">
        <button className="btn" onClick={onPublish} disabled={loadingCollections || publishing || !collectionId}>
          {publishing ? '发布中...' : '发布到 Intercom'}
        </button>
        {loadingCollections ? <span className="muted">正在读取 collections...</span> : null}
        {status ? <span className="muted">{status}</span> : null}
      </div>
    </div>
  );
}
