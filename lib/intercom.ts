const REGION_HOSTS: Record<string, string> = {
  us: 'https://api.intercom.io',
  eu: 'https://api.eu.intercom.io',
  au: 'https://api.au.intercom.io',
};

export type IntercomDraftArticle = {
  title: string;
  body?: string;
  html?: string;
  needsConfirmation?: string[];
};

export type IntercomCollection = {
  id: string;
  name: string;
  pathLabel: string;
  depth: number;
  url?: string;
  parentId: string | null;
};

type IntercomCollectionRaw = {
  id: string | number;
  name?: string;
  url?: string;
  parent_id?: string | number | null;
  translated_content?: Record<string, { name?: string }>;
};

function getBaseUrl() {
  const region = process.env.INTERCOM_REGION || 'us';
  return REGION_HOSTS[region] || REGION_HOSTS.us;
}

function getHeaders() {
  return {
    Authorization: `Bearer ${process.env.INTERCOM_ACCESS_TOKEN}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Intercom-Version': '2.10',
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderInlineMarkdown(text: string) {
  const escaped = escapeHtml(text);
  return escaped.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noreferrer">$1</a>'
  );
}

function isHeadingLine(line: string) {
  return /^##\s+/.test(line);
}

function isOrderedListItem(line: string) {
  return /^\d+[.)）]\s+/.test(line);
}

function isUnorderedListItem(line: string) {
  return /^[-*]\s+/.test(line);
}

function stripListMarker(line: string) {
  return line.replace(/^\d+[.)）]\s+/, '').replace(/^[-*]\s+/, '');
}

function normalizeBodyMarkdown(text: string) {
  let normalized = String(text || '').replace(/\r\n/g, '\n');

  normalized = normalized.replace(/^(\d+)[)）]\s+/gm, '$1. ');
  normalized = normalized.replace(
    /打开([A-Za-z0-9\u4e00-\u9fff_-]*?(?:页面|教程|文档|链接))\s+(https?:\/\/[^\s)]+)/g,
    '打开[$1]($2)'
  );
  normalized = normalized.replace(
    /参考([A-Za-z0-9\u4e00-\u9fff_-]*?(?:教程|文档|链接))[:：]\s*(https?:\/\/[^\s)]+)/g,
    '参考[$1]($2)'
  );
  normalized = normalized.replace(
    /([A-Za-z0-9\u4e00-\u9fff_-]*?(?:页面|教程|文档|链接))[:：]\s*(https?:\/\/[^\s)]+)/g,
    '[$1]($2)'
  );

  const lines = normalized.split('\n');
  const compact: string[] = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const prev = compact.length > 0 ? compact[compact.length - 1].trim() : '';
    const next = index + 1 < lines.length ? lines[index + 1].trim() : '';
    const current = line.trim();

    if (!current) {
      const aroundList =
        (prev && (isOrderedListItem(prev) || isUnorderedListItem(prev))) ||
        (next && (isOrderedListItem(next) || isUnorderedListItem(next)));
      if (aroundList) continue;
      if (compact.length > 0 && compact[compact.length - 1] === '') continue;
      compact.push('');
      continue;
    }

    compact.push(line);
  }

  return compact.join('\n').trim();
}

function renderMarkdownBlocks(text: string) {
  const lines = normalizeBodyMarkdown(text).split('\n');
  const html: string[] = [];
  let paragraph: string[] = [];
  let listType: 'ol' | 'ul' | null = null;
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    html.push(`<p>${renderInlineMarkdown(paragraph.join(' '))}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (!listType || listItems.length === 0) return;
    html.push(`<${listType}>`);
    for (const item of listItems) {
      html.push(`<li>${renderInlineMarkdown(item)}</li>`);
    }
    html.push(`</${listType}>`);
    listType = null;
    listItems = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    if (isHeadingLine(line)) {
      flushParagraph();
      flushList();
      html.push(`<h2>${renderInlineMarkdown(line.replace(/^##\s+/, ''))}</h2>`);
      continue;
    }

    if (isOrderedListItem(line)) {
      flushParagraph();
      if (listType && listType !== 'ol') flushList();
      listType = 'ol';
      listItems.push(stripListMarker(line));
      continue;
    }

    if (isUnorderedListItem(line)) {
      flushParagraph();
      if (listType && listType !== 'ul') flushList();
      listType = 'ul';
      listItems.push(stripListMarker(line));
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  return html;
}

function applyInlineStyleToTag(html: string, tag: string, style: string) {
  const pattern = new RegExp(`<${tag}(\\s[^>]*)?>`, 'gi');
  return html.replace(pattern, (_match, attrs = '') => {
    if (/style\s*=\s*/i.test(attrs)) {
      return `<${tag}${attrs}>`;
    }
    return `<${tag}${attrs} style="${style}">`;
  });
}

function normalizeIntercomStructure(html: string) {
  let output = String(html || '').trim();

  output = output.replace(/<blockquote>\s*<p>([\s\S]*?)<\/p>\s*<\/blockquote>/gi, '<blockquote>$1</blockquote>');
  output = output.replace(/<li>\s*<p>([\s\S]*?)<\/p>\s*<\/li>/gi, '<li>$1</li>');
  output = output.replace(/<p>\s*<\/p>/gi, '');
  output = output.replace(/(<\/p>)\s*(<p>)/gi, '$1$2');
  output = output.replace(/(<\/blockquote>)\s*(<p>)/gi, '$1$2');
  output = output.replace(/(<\/p>)\s*(<blockquote>)/gi, '$1$2');
  output = output.replace(/(<\/ul>|<\/ol>)\s*(<p>)/gi, '$1$2');
  output = output.replace(/(<\/p>)\s*(<ul>|<ol>)/gi, '$1$2');
  output = output.replace(/\n+/g, '');
  output = output.replace(/>\s+</g, '><');

  return output.trim();
}

function toIntercomHtml(html: string) {
  let output = normalizeIntercomStructure(html);

  output = applyInlineStyleToTag(output, 'h1', 'font-size:32px;line-height:1.35;margin:0 0 18px;font-weight:700;color:#111827;');
  output = applyInlineStyleToTag(output, 'h2', 'font-size:24px;line-height:1.45;margin:20px 0 10px;font-weight:700;color:#111827;');
  output = applyInlineStyleToTag(output, 'h3', 'font-size:20px;line-height:1.5;margin:16px 0 8px;font-weight:700;color:#111827;');
  output = applyInlineStyleToTag(output, 'p', 'margin:8px 0;line-height:1.7;color:#111827;');
  output = applyInlineStyleToTag(output, 'ul', 'margin:8px 0 8px 24px;padding:0;');
  output = applyInlineStyleToTag(output, 'ol', 'margin:8px 0 8px 24px;padding:0;');
  output = applyInlineStyleToTag(output, 'li', 'margin:4px 0;line-height:1.7;color:#111827;');
  output = applyInlineStyleToTag(output, 'blockquote', 'margin:12px 0;padding:10px 14px;border-left:4px solid #d1d5db;background:#f8fafc;color:#374151;');
  output = applyInlineStyleToTag(output, 'a', 'color:#2563eb;text-decoration:underline;');
  output = applyInlineStyleToTag(output, 'strong', 'font-weight:700;color:#111827;');

  return output;
}

function renderArticleHtml(article: IntercomDraftArticle, locale: string) {
  if (article.html && String(article.html).trim()) {
    return toIntercomHtml(String(article.html).trim());
  }

  const lines = renderMarkdownBlocks(article.body || '');
  const notes: string[] = [];

  for (const item of article.needsConfirmation || []) {
    notes.push(`Needs confirmation: ${item}`);
  }

  if (notes.length > 0) {
    lines.push(`<h2>${escapeHtml(locale === 'zh-CN' ? 'Needs confirmation' : 'Needs confirmation')}</h2>`);
    lines.push('<ul>');
    for (const note of notes) {
      lines.push(`<li>${escapeHtml(note)}</li>`);
    }
    lines.push('</ul>');
  }

  return lines.join('\n');
}

async function requestJson(path: string, options: RequestInit = {}) {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {}),
    },
    cache: 'no-store',
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${path} failed: ${response.status} ${text}`);
  }

  return data;
}

async function requestAllPages(path: string) {
  const results: Record<string, unknown>[] = [];
  let nextPath: string = path;

  for (let page = 0; page < 50 && nextPath; page += 1) {
    const payload = await requestJson(nextPath);
    results.push(...(((payload as { data?: Record<string, unknown>[] }).data) || []));

    const next = (payload as { pages?: { next?: string | { page?: string; starting_after?: string } } }).pages?.next;
    if (!next) break;

    if (typeof next === 'string') {
      const url = new URL(next);
      nextPath = `${url.pathname}${url.search}`;
      continue;
    }

    if (next.page) {
      const separator = nextPath.includes('?') ? '&' : '?';
      nextPath = `${path}${separator}page=${encodeURIComponent(next.page)}`;
      continue;
    }

    if (next.starting_after) {
      const separator = path.includes('?') ? '&' : '?';
      nextPath = `${path}${separator}starting_after=${encodeURIComponent(next.starting_after)}`;
      continue;
    }

    break;
  }

  return results;
}

async function getAuthorId() {
  const me = await requestJson('/me');
  const id = (me as { id?: string | number }).id;
  if (!id) throw new Error('Could not determine Intercom author id');
  return id;
}

function buildContent(article: IntercomDraftArticle, authorId: string | number, state: string, locale: string) {
  return {
    title: article.title,
    description: '',
    body: renderArticleHtml(article, locale),
    author_id: authorId,
    state,
  };
}

export function validateIntercomConfig() {
  if (!process.env.INTERCOM_ACCESS_TOKEN) {
    throw new Error('INTERCOM_ACCESS_TOKEN is not configured');
  }
}

export async function getCollections(locale = 'zh-CN'): Promise<IntercomCollection[]> {
  const items = (await requestAllPages('/help_center/collections')) as IntercomCollectionRaw[];
  const collectionMap = new Map(
    items.map((item) => [
      String(item.id),
      {
        ...item,
        id: String(item.id),
        parentId: item.parent_id ? String(item.parent_id) : null,
        localizedName:
          item.translated_content?.[locale]?.name ||
          item.translated_content?.en?.name ||
          item.name || '',
      },
    ])
  );

  const getPathNames = (item: { localizedName: string; name?: string; parentId: string | null } | undefined) => {
    const names: string[] = [];
    let current = item;

    for (let depth = 0; depth < 10 && current; depth += 1) {
      names.unshift(current.localizedName || current.name || '');
      current = current.parentId ? collectionMap.get(current.parentId) : undefined;
    }

    return names;
  };

  return items.map((item) => {
    const normalized = collectionMap.get(String(item.id));
    const pathNames = getPathNames(normalized);
    return {
      id: String(normalized?.id || item.id),
      name: normalized?.localizedName || item.name || '',
      pathLabel: pathNames.join(' / '),
      depth: Math.max(0, pathNames.length - 1),
      url: item.url,
      parentId: normalized?.parentId || null,
    };
  });
}

export async function publishArticle({
  article,
  collectionId,
  locale,
  state,
}: {
  article: IntercomDraftArticle;
  collectionId: string;
  locale: string;
  state: string;
}) {
  const authorId = await getAuthorId();
  const payload: Record<string, unknown> = {
    ...buildContent(article, authorId, state, 'en'),
    parent_type: 'collection',
    parent_id: Number(collectionId),
  };

  if (locale !== 'en') {
    payload.translated_content = {
      [locale]: buildContent(article, authorId, state, locale),
    };
  }

  return requestJson('/articles', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function buildOpenUrl(article: Record<string, any>, { locale }: { locale: string }) {
  if (article.url) return article.url as string;
  const translated = article.translated_content?.[locale];
  if (translated?.url) return translated.url as string;
  return null;
}
