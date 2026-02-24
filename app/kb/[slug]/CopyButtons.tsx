'use client';

import { useCallback, useMemo, useState } from 'react';

export function CopyButtons({
  articleSelector,
  markdown,
}: {
  articleSelector: string;
  markdown: string;
}) {
  const [status, setStatus] = useState<string>('');

  const plaintextFromMarkdown = useMemo(() => markdown.trim(), [markdown]);

  const copyHtml = useCallback(async () => {
    setStatus('');
    const el = document.querySelector(articleSelector);
    if (!el) {
      setStatus('找不到文章区域，复制失败');
      return;
    }

    try {
      const html = (el as HTMLElement).innerHTML;
      const text = (el as HTMLElement).innerText;

      const item = new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([text], { type: 'text/plain' }),
      });

      await navigator.clipboard.write([item]);
      setStatus('已复制（富文本/HTML）');
    } catch {
      // Fallback: plain text
      try {
        await navigator.clipboard.writeText((el as HTMLElement).innerText);
        setStatus('已复制（纯文本，浏览器不支持 HTML 复制）');
      } catch {
        setStatus('复制失败：请手动全选复制');
      }
    }
  }, [articleSelector]);

  const copyMarkdown = useCallback(async () => {
    setStatus('');
    try {
      await navigator.clipboard.writeText(plaintextFromMarkdown);
      setStatus('已复制（Markdown）');
    } catch {
      setStatus('复制失败：请手动复制');
    }
  }, [plaintextFromMarkdown]);

  const copyIntercomSafe = useCallback(async () => {
    // Some editors behave better when we copy a full HTML document fragment.
    setStatus('');
    const el = document.querySelector(articleSelector);
    if (!el) {
      setStatus('找不到文章区域，复制失败');
      return;
    }

    const containerHtml = `<!doctype html><html><body>${(el as HTMLElement).innerHTML}</body></html>`;
    const containerText = (el as HTMLElement).innerText;

    try {
      const item = new ClipboardItem({
        'text/html': new Blob([containerHtml], { type: 'text/html' }),
        'text/plain': new Blob([containerText], { type: 'text/plain' }),
      });
      await navigator.clipboard.write([item]);
      setStatus('已复制（HTML 容器）');
    } catch {
      try {
        await navigator.clipboard.writeText(containerText);
        setStatus('已复制（纯文本，浏览器不支持 HTML 复制）');
      } catch {
        setStatus('复制失败：请手动全选复制');
      }
    }
  }, [articleSelector]);

  return (
    <div className="row" style={{ margin: '12px 0' }}>
      <button className="btn" onClick={copyHtml}>
        复制（富文本/HTML）
      </button>
      <button className="btn" onClick={copyIntercomSafe}>
        复制（HTML 容器）
      </button>
      <button className="btn" onClick={copyMarkdown}>
        复制（Markdown）
      </button>
      {status ? <span className="muted">{status}</span> : null}
    </div>
  );
}
