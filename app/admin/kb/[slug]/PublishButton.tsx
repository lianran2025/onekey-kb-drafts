'use client';

import { useState } from 'react';

export function PublishButton({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const onPublish = async () => {
    setLoading(true);
    setStatus('');

    try {
      const res = await fetch(`/api/admin/kb/${slug}/publish`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || '发布失败');
      setStatus(data?.message || '已触发发布');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '发布失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row" style={{ margin: '12px 0' }}>
      <button className="btn" onClick={onPublish} disabled={loading}>
        {loading ? '发布中...' : '发布到 Intercom'}
      </button>
      {status ? <span className="muted">{status}</span> : null}
    </div>
  );
}
