'use client';

import { useEffect, useState } from 'react';

type CollectionItem = {
  id: string;
  name: string;
  pathLabel: string;
};

export function PublishPanel({ slug }: { slug: string }) {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [collectionId, setCollectionId] = useState('');
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
        if (items.length > 0) {
          setCollectionId(items[0].id);
        }
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
    <div className="publish-panel">
      <label className="publish-label">
        <span>Intercom Collection</span>
        <select
          className="publish-select"
          value={collectionId}
          onChange={(event) => setCollectionId(event.target.value)}
          disabled={loadingCollections || publishing || collections.length === 0}
        >
          <option value="">请选择 collection</option>
          {collections.map((item) => (
            <option key={item.id} value={item.id}>
              {item.pathLabel || item.name}
            </option>
          ))}
        </select>
      </label>

      <div className="row">
        <button className="btn" onClick={onPublish} disabled={loadingCollections || publishing || !collectionId}>
          {publishing ? '发布中...' : '发布到 Intercom'}
        </button>
        {loadingCollections ? <span className="muted">正在读取 collections...</span> : null}
        {status ? <span className="muted">{status}</span> : null}
      </div>
    </div>
  );
}
