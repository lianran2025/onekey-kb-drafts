'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function DeleteButton({ slug }: { slug: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const onDelete = async () => {
    const confirmed = window.confirm('确认删除这篇文章吗？删除后将无法恢复。');
    if (!confirmed) return;

    setLoading(true);
    setStatus('');

    try {
      const res = await fetch(`/api/kb/${slug}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || '删除失败');
      }

      router.push('/');
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '删除失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row" style={{ margin: '12px 0' }}>
      <button className="btn" onClick={onDelete} disabled={loading}>
        {loading ? '删除中...' : '删除文章'}
      </button>
      {status ? <span className="muted">{status}</span> : null}
    </div>
  );
}
