'use client';

import { useEffect, useMemo, useState } from 'react';

type CollectionItem = {
  id: string;
  name: string;
  pathLabel: string;
  parentId?: string | null;
};

type ValidationIssue = {
  level: 'error' | 'warning';
  message: string;
  context?: string;
};

export function PublishPanel({ slug }: { slug: string }) {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [status, setStatus] = useState('');
  const [issues, setIssues] = useState<ValidationIssue[]>([]);

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
    setIssues([]);

    try {
      const res = await fetch(`/api/admin/kb/${slug}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collectionId }),
      });
      const data = await res.json().catch(() => ({}));
      const validationIssues = (data?.validation?.issues || data?.readBackValidation?.issues || []) as ValidationIssue[];
      setIssues(validationIssues);
      if (!res.ok) throw new Error(data?.error || '发布失败');
      const readBackIssues = (data?.readBackValidation?.issues || []) as ValidationIssue[];
      const readBackErrors = readBackIssues.filter((issue) => issue.level === 'error').length;
      const readBackWarnings = readBackIssues.filter((issue) => issue.level === 'warning').length;
      const suffix =
        data?.readBackError
          ? `，但回读校验失败：${data.readBackError}`
          : readBackErrors > 0 || readBackWarnings > 0
          ? `，回读校验：${readBackErrors} 个错误，${readBackWarnings} 个提醒`
          : '，回读校验通过';
      setStatus(data?.openUrl ? `发布成功：${data.openUrl}${suffix}` : `${data?.message || '发布成功'}${suffix}`);
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

      {issues.length > 0 ? (
        <div className="publish-issues">
          {issues.slice(0, 6).map((issue, index) => (
            <div key={`${issue.level}-${index}`} className={`publish-issue publish-issue-${issue.level}`}>
              {issue.level === 'error' ? '错误' : '提醒'}：{issue.message}
            </div>
          ))}
          {issues.length > 6 ? <div className="muted">还有 {issues.length - 6} 项未显示，请查看 Intercom 发布预览。</div> : null}
        </div>
      ) : null}
    </div>
  );
}
