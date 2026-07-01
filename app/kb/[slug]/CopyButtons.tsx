'use client';

import { useCallback, useState } from 'react';

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function normalizeCodeBlocks(root: HTMLElement) {
  root.querySelectorAll('pre').forEach((pre) => {
    const lines = (pre.textContent || '').replace(/\n$/, '').split('\n');
    pre.innerHTML = lines.map(escapeHtml).join('<br>');
  });
}

function normalizeInterruptedOrderedLists(root: HTMLElement) {
  root.querySelectorAll('ol').forEach((ol) => {
    const items = Array.from(ol.children).filter((child) => child.tagName.toLowerCase() === 'li');
    if (items.length !== 1) return;

    const start = Number(ol.getAttribute('start') || '1');
    if (!Number.isFinite(start) || start < 1) return;

    const paragraph = document.createElement('p');
    paragraph.innerHTML = `${start}. ${(items[0] as HTMLElement).innerHTML}`;
    ol.replaceWith(paragraph);
  });
}

function getClipboardHtml(el: HTMLElement) {
  const clone = el.cloneNode(true) as HTMLElement;
  normalizeCodeBlocks(clone);
  normalizeInterruptedOrderedLists(clone);
  return clone.innerHTML;
}

export function CopyButtons({
  articleSelector,
}: {
  articleSelector: string;
}) {
  const [status, setStatus] = useState<string>('');

  const copyHtml = useCallback(async () => {
    setStatus('');
    const el = document.querySelector(articleSelector);
    if (!el) {
      setStatus('找不到文章区域，复制失败');
      return;
    }

    try {
      const html = getClipboardHtml(el as HTMLElement);
      const text = (el as HTMLElement).innerText;

      const item = new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([text], { type: 'text/plain' }),
      });

      await navigator.clipboard.write([item]);
      setStatus('已复制（富文本/HTML）');
    } catch {
      try {
        await navigator.clipboard.writeText((el as HTMLElement).innerText);
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
      {status ? <span className="muted">{status}</span> : null}
    </div>
  );
}
