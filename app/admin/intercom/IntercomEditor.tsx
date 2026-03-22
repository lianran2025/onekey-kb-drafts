'use client';

import { useMemo, useState } from 'react';

type CollectionItem = { id: string; name: string; pathLabel: string; parentId?: string | null };

type LoadedArticle = {
  id: string;
  title: string;
  body: string;
  html: string;
  state: string;
  collectionId: string;
  collectionPathIds: string[];
  collectionPathLabel: string;
};

export function IntercomEditor() {
  const [articleId, setArticleId] = useState('');
  const [article, setArticle] = useState<LoadedArticle | null>(null);
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [editMode, setEditMode] = useState<'markdown' | 'html'>('markdown');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

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

  const selectedCollectionId = selectedPath[selectedPath.length - 1] || '';
  const selectedCollection = collections.find((item) => item.id === selectedCollectionId) || null;

  const loadArticle = async () => {
    if (!articleId.trim()) {
      setStatus('请输入文章 ID');
      return;
    }

    setLoading(true);
    setStatus('');
    try {
      const [collectionsRes, articleRes] = await Promise.all([
        fetch('/api/admin/intercom/collections', { cache: 'no-store' }),
        fetch(`/api/admin/intercom/articles/${encodeURIComponent(articleId)}?locale=zh-CN`, {
          cache: 'no-store',
        }),
      ]);

      const collectionsData = await collectionsRes.json().catch(() => ({}));
      const articleData = await articleRes.json().catch(() => ({}));

      if (!collectionsRes.ok) throw new Error(collectionsData?.error || '读取 collection 失败');
      if (!articleRes.ok) throw new Error(articleData?.error || '读取文章失败');

      setCollections(collectionsData.collections || []);
      setArticle(articleData.article);
      setSelectedPath(articleData.article.collectionPathIds || []);
      setStatus('文章已读取，已自动回填当前 collection');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '读取文章失败');
    } finally {
      setLoading(false);
    }
  };

  const updateLevel = (index: number, value: string) => {
    setSelectedPath((current) => {
      const next = current.slice(0, index);
      if (value) next.push(value);
      return next;
    });
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
            body: editMode === 'markdown' ? article.body : undefined,
            html: editMode === 'html' ? article.html : undefined,
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

          <div className="publish-label">
            <span>当前 Collection</span>
            <div className="cascade-grid">
              {levels.map((level, index) => (
                <select
                  key={`${level.parentId ?? 'root'}-${index}`}
                  className="publish-select"
                  value={level.selected}
                  onChange={(event) => updateLevel(index, event.target.value)}
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
          </div>

          {(selectedCollection || article.collectionPathLabel) ? (
            <div className="selected-collection">
              <span className="badge">{selectedCollection?.pathLabel || article.collectionPathLabel}</span>
            </div>
          ) : null}

          <div className="row">
            <button className={`btn btn-small ${editMode === 'markdown' ? '' : 'btn-ghost'}`} type="button" onClick={() => setEditMode('markdown')}>
              Markdown 编辑
            </button>
            <button className={`btn btn-small ${editMode === 'html' ? '' : 'btn-ghost'}`} type="button" onClick={() => setEditMode('html')}>
              HTML 保真编辑
            </button>
          </div>

          {editMode === 'markdown' ? (
            <textarea
              className="intercom-textarea"
              value={article.body}
              onChange={(e) => setArticle({ ...article, body: e.target.value })}
              placeholder="文章正文（Markdown）"
            />
          ) : (
            <textarea
              className="intercom-textarea"
              value={article.html}
              onChange={(e) => setArticle({ ...article, html: e.target.value })}
              placeholder="文章正文（HTML）"
            />
          )}

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
