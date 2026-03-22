'use client';

import { useState } from 'react';

type CollectionItem = { id: string; name: string; pathLabel: string; parentId?: string | null };

type LoadedArticle = {
  id: string;
  title: string;
  body: string;
  state: string;
  collectionId: string;
};

export function IntercomEditor() {
  const [articleId, setArticleId] = useState('');
  const [article, setArticle] = useState<LoadedArticle | null>(null);
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const loadCollections = async () => {
    const res = await fetch('/api/admin/intercom/collections', { cache: 'no-store' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || '读取 collection 失败');
    setCollections(data.collections || []);
  };

  const loadArticle = async () => {
    if (!articleId.trim()) {
      setStatus('请输入文章 ID');
      return;
    }

    setLoading(true);
    setStatus('');
    try {
      await loadCollections();
      const res = await fetch(`/api/admin/intercom/articles/${encodeURIComponent(articleId)}?locale=zh-CN`, {
        cache: 'no-store',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || '读取文章失败');
      setArticle(data.article);
      setSelectedCollectionId(data.article.collectionId || '');
      setStatus('文章已读取');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '读取文章失败');
    } finally {
      setLoading(false);
    }
  };

  const saveArticle = async () => {
    if (!article) return;
    setLoading(true);
    setStatus('');
    try {
      const res = await fetch(`/api/admin/intercom/articles/${encodeURIComponent(article.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draft: {
            title: article.title,
            body: article.body,
            needsConfirmation: [],
          },
          collectionId: selectedCollectionId,
          locale: 'zh-CN',
          state: article.state || 'draft',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || '保存失败');
      setStatus(data?.openUrl ? `保存成功：${data.openUrl}` : '保存成功');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="intercom-editor">
      <div className="intercom-load-row">
        <input
          className="publish-select"
          placeholder="输入 Intercom 文章 ID"
          value={articleId}
          onChange={(e) => setArticleId(e.target.value)}
        />
        <button className="btn" type="button" onClick={loadArticle} disabled={loading}>
          {loading ? '读取中...' : '读取文章'}
        </button>
      </div>

      {article ? (
        <div className="intercom-editor-stack">
          <input
            className="publish-select"
            value={article.title}
            onChange={(e) => setArticle({ ...article, title: e.target.value })}
            placeholder="文章标题"
          />

          <select
            className="publish-select"
            value={selectedCollectionId}
            onChange={(e) => setSelectedCollectionId(e.target.value)}
          >
            <option value="">请选择 collection</option>
            {collections.map((item) => (
              <option key={item.id} value={item.id}>
                {item.pathLabel || item.name}
              </option>
            ))}
          </select>

          <textarea
            className="intercom-textarea"
            value={article.body}
            onChange={(e) => setArticle({ ...article, body: e.target.value })}
            placeholder="文章正文"
          />

          <div className="row">
            <button className="btn" type="button" onClick={saveArticle} disabled={loading}>
              {loading ? '保存中...' : '保存修改'}
            </button>
          </div>
        </div>
      ) : null}

      {status ? <p className="muted">{status}</p> : null}
    </div>
  );
}
