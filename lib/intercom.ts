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

export type IntercomEditableArticle = {
  id: string;
  collectionId: string;
  state: string;
  title: string;
  body: string;
  html: string;
  needsConfirmation: string[];
};

export type IntercomArticleListItem = {
  id: string;
  title: string;
  state: string;
  collectionId: string;
  collectionPathLabel: string;
  updatedAt: string;
  publicUrl: string;
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

function decodeHtml(value: string) {
  return value
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'");
}

function stripTags(value: string) {
  return decodeHtml(String(value || '').replace(/<[^>]+>/g, ''));
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
    for (const item of listItems) html.push(`<li>${renderInlineMarkdown(item)}</li>`);
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
    if (/style\s*=\s*/i.test(attrs)) return `<${tag}${attrs}>`;
    return `<${tag}${attrs} style="${style}">`;
  });
}

function unwrapTag(html: string, tag: string) {
  const pattern = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`, 'gi');
  return html.replace(pattern, '$1');
}

function normalizeIntercomStructure(html: string) {
  let output = String(html || '').trim();
  output = output.replace(/<blockquote>\s*<p>([\s\S]*?)<\/p>\s*<\/blockquote>/gi, '<blockquote>$1</blockquote>');
  output = output.replace(/<li>\s*<p>([\s\S]*?)<\/p>\s*<\/li>/gi, '<li>$1</li>');
  output = output.replace(/<p>\s*<\/p>/gi, '');
  output = output.replace(/<blockquote>\s*(?:<strong[^>]*>)?\s*提示[:：]?\s*(?:<\/strong>)?\s*([\s\S]*?)<\/blockquote>/gi, '<p><strong>提示：</strong>$1</p>');
  output = output.replace(/<blockquote>\s*([\s\S]*?)<\/blockquote>/gi, '<p><strong>提示：</strong>$1</p>');
  output = output.replace(/<p>\s*(<strong[^>]*>提示[:：]?<\/strong>)\s*<\/p>/gi, '<p>$1</p>');
  output = output.replace(/(<\/p>)\s*(<p>)/gi, '$1$2');
  output = output.replace(/(<\/ul>|<\/ol>)\s*(<p>)/gi, '$1$2');
  output = output.replace(/(<\/p>)\s*(<ul>|<ol>)/gi, '$1$2');
  output = output.replace(/<p>\s*(<(?:ul|ol)[\s\S]*?<\/(?:ul|ol)>)\s*<\/p>/gi, '$1');
  output = unwrapTag(output, 'div');
  output = output.replace(/\n+/g, '');
  output = output.replace(/>\s+</g, '><');
  return output.trim();
}

function toIntercomHtml(html: string) {
  let output = normalizeIntercomStructure(html);
  output = applyInlineStyleToTag(output, 'h1', 'font-size:32px;line-height:1.35;margin:0 0 14px;font-weight:700;color:#111827;');
  output = applyInlineStyleToTag(output, 'h2', 'font-size:24px;line-height:1.45;margin:16px 0 8px;font-weight:700;color:#111827;');
  output = applyInlineStyleToTag(output, 'h3', 'font-size:20px;line-height:1.5;margin:12px 0 6px;font-weight:700;color:#111827;');
  output = applyInlineStyleToTag(output, 'p', 'margin:6px 0;line-height:1.65;color:#111827;');
  output = applyInlineStyleToTag(output, 'ul', 'margin:6px 0 6px 22px;padding:0;');
  output = applyInlineStyleToTag(output, 'ol', 'margin:6px 0 6px 22px;padding:0;');
  output = applyInlineStyleToTag(output, 'li', 'margin:2px 0;line-height:1.65;color:#111827;');
  output = applyInlineStyleToTag(output, 'a', 'color:#2563eb;text-decoration:underline;');
  output = applyInlineStyleToTag(output, 'strong', 'font-weight:700;color:#111827;');
  return output;
}

function renderArticleHtml(article: IntercomDraftArticle, locale: string) {
  if (article.html && String(article.html).trim()) return toIntercomHtml(String(article.html).trim());
  const lines = renderMarkdownBlocks(article.body || '');
  const notes: string[] = [];
  for (const item of article.needsConfirmation || []) notes.push(`Needs confirmation: ${item}`);
  if (notes.length > 0) {
    lines.push(`<h2>${escapeHtml(locale === 'zh-CN' ? 'Needs confirmation' : 'Needs confirmation')}</h2>`);
    lines.push('<ul>');
    for (const note of notes) lines.push(`<li>${escapeHtml(note)}</li>`);
    lines.push('</ul>');
  }
  return lines.join('\n');
}

function htmlToEditableMarkdown(html: string) {
  let text = String(html || '');
  text = text.replace(/<a [^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/gis, (_match, url, label) => `[${stripTags(label).trim()}](${url})`);
  text = text.replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gis, (_match, content) => `## ${stripTags(content).trim()}\n\n`);
  text = text.replace(/<ol[^>]*>(.*?)<\/ol>/gis, (_match: string, content: string) => {
    let index = 0;
    return content.replace(/<li[^>]*>(.*?)<\/li>/gis, (_liMatch: string, liContent: string) => {
      index += 1;
      return `${index}. ${stripTags(liContent).trim()}\n`;
    });
  });
  text = text.replace(/<ul[^>]*>(.*?)<\/ul>/gis, (_match: string, content: string) => {
    return content.replace(/<li[^>]*>(.*?)<\/li>/gis, (_liMatch: string, liContent: string) => `- ${stripTags(liContent).trim()}\n`);
  });
  text = text.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, (_match, content) => `提示：${stripTags(content).trim()}\n\n`);
  text = text.replace(/<\/p>\s*<p[^>]*>/gis, '\n\n');
  text = text.replace(/<br\s*\/?>/gis, '\n');
  text = stripTags(text);
  text = text.replace(/\n{3,}/g, '\n\n').trim();
  return text;
}

async function requestJson(path: string, options: RequestInit = {}) {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    ...options,
    headers: { ...getHeaders(), ...(options.headers || {}) },
    cache: 'no-store',
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) throw new Error(`${options.method || 'GET'} ${path} failed: ${response.status} ${text}`);
  return data;
}

let collectionsCache: { expiresAt: number; data: IntercomCollection[] } | null = null;

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

async function getArticleById(articleId: string) {
  return requestJson(`/articles/${articleId}`);
}

async function getHelpCenters() {
  const payload = await requestJson('/help_center/help_centers');
  return ((payload as { data?: Record<string, any>[] }).data) || [];
}

async function findArticleInList(articleId: string) {
  const helpCenters = await getHelpCenters();
  const helpCenterId = helpCenters[0]?.id;

  let path = helpCenterId
    ? `/articles?help_center_id=${encodeURIComponent(String(helpCenterId))}`
    : '/articles';

  for (let page = 0; page < 50; page += 1) {
    const payload = await requestJson(path);
    const items = ((payload as { data?: Record<string, any>[] }).data) || [];
    const found = items.find((item) => String(item.id) === String(articleId));
    if (found) return found;

    const next = (payload as { pages?: { next?: string | { starting_after?: string } } }).pages?.next;
    if (!next) break;

    if (typeof next === 'string') {
      const url = new URL(next);
      path = `${url.pathname}${url.search}`;
      continue;
    }

    if (next.starting_after) {
      path = helpCenterId
        ? `/articles?help_center_id=${encodeURIComponent(String(helpCenterId))}&starting_after=${encodeURIComponent(next.starting_after)}`
        : `/articles?starting_after=${encodeURIComponent(next.starting_after)}`;
      continue;
    }

    break;
  }

  return null;
}

function getLocalizedArticleContent(article: Record<string, any>, locale: string) {
  return article.translated_content?.[locale] || article;
}

function normalizeUpdatedAt(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Date(value * 1000).toISOString();
  }

  const text = String(value || '').trim();
  if (!text) return '';

  if (/^\d{10}$/.test(text)) {
    return new Date(Number(text) * 1000).toISOString();
  }

  if (/^\d{13}$/.test(text)) {
    return new Date(Number(text)).toISOString();
  }

  const parsed = Date.parse(text);
  if (!Number.isNaN(parsed)) {
    return new Date(parsed).toISOString();
  }

  return text;
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

function buildCollectionMaps(items: IntercomCollectionRaw[], locale: string) {
  const collectionMap = new Map(
    items.map((item) => [
      String(item.id),
      {
        ...item,
        id: String(item.id),
        parentId: item.parent_id ? String(item.parent_id) : null,
        localizedName: item.translated_content?.[locale]?.name || item.translated_content?.en?.name || item.name || '',
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

  return { collectionMap, getPathNames };
}

export function validateIntercomConfig() {
  if (!process.env.INTERCOM_ACCESS_TOKEN) throw new Error('INTERCOM_ACCESS_TOKEN is not configured');
}

export async function getCollections(locale = 'zh-CN', useCache = true): Promise<IntercomCollection[]> {
  if (useCache && collectionsCache && collectionsCache.expiresAt > Date.now()) {
    return collectionsCache.data;
  }

  const items = (await requestAllPages('/help_center/collections')) as IntercomCollectionRaw[];
  const { collectionMap, getPathNames } = buildCollectionMaps(items, locale);

  const collections = items.map((item) => {
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

  collectionsCache = { data: collections, expiresAt: Date.now() + 5 * 60 * 1000 };
  return collections;
}

export async function getEditableArticle(articleId: string, locale = 'zh-CN'): Promise<IntercomEditableArticle> {
  const article = await getArticleById(articleId);
  const articleRecord = article as Record<string, any>;
  const fallback = articleRecord.parent_id ? null : await findArticleInList(articleId);
  const localized = getLocalizedArticleContent(articleRecord, locale);
  const collectionId = String(articleRecord.parent_id || fallback?.parent_id || '');
  const rawHtml = String(localized.body || articleRecord.body || '');

  return {
    id: String(articleRecord.id),
    collectionId,
    state: String(localized.state || articleRecord.state || 'draft'),
    title: String(localized.title || articleRecord.title || ''),
    body: htmlToEditableMarkdown(rawHtml),
    html: rawHtml,
    needsConfirmation: [],
  };
}

export async function listArticles(locale = 'zh-CN'): Promise<IntercomArticleListItem[]> {
  const helpCenters = await getHelpCenters();
  const helpCenterId = helpCenters[0]?.id;
  const path = helpCenterId
    ? `/articles?help_center_id=${encodeURIComponent(String(helpCenterId))}`
    : '/articles';

  const [collections, items] = await Promise.all([
    getCollections(locale),
    requestAllPages(path),
  ]);

  const collectionMap = new Map(collections.map((item) => [item.id, item]));

  return (items as Record<string, any>[]).map((item) => {
    const localized = getLocalizedArticleContent(item, locale);
    const collectionId = String(item.parent_id || '');
    const collection = collectionMap.get(collectionId);
    return {
      id: String(item.id),
      title: String(localized.title || item.title || ''),
      state: String(localized.state || item.state || 'draft'),
      collectionId,
      collectionPathLabel: collection?.pathLabel || '',
      updatedAt: normalizeUpdatedAt(localized.updated_at || item.updated_at || item.updated_at_timestamp || ''),
      publicUrl: String(localized.url || item.url || ''),
    };
  });
}

export async function publishArticle({ article, collectionId, locale, state }: { article: IntercomDraftArticle; collectionId: string; locale: string; state: string; }) {
  const authorId = await getAuthorId();
  const payload: Record<string, unknown> = {
    ...buildContent(article, authorId, state, 'en'),
    parent_type: 'collection',
    parent_id: Number(collectionId),
  };
  if (locale !== 'en') payload.translated_content = { [locale]: buildContent(article, authorId, state, locale) };
  return requestJson('/articles', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateArticle({ articleId, article, locale, state, collectionId }: { articleId: string; article: IntercomDraftArticle; locale: string; state: string; collectionId?: string; }) {
  const existing = await getArticleById(articleId);
  const authorId = await getAuthorId();
  const payload: Record<string, unknown> = {};
  const fallback = (existing as Record<string, any>).parent_id ? null : await findArticleInList(articleId);
  const resolvedCollectionId = (existing as Record<string, any>).parent_id || fallback?.parent_id || collectionId;

  if (resolvedCollectionId) {
    payload.parent_type = (existing as Record<string, any>).parent_type || 'collection';
    payload.parent_id = Number(resolvedCollectionId);
  }

  if (locale === 'en') {
    Object.assign(payload, buildContent(article, authorId, state, 'en'));
  } else {
    payload.translated_content = { [locale]: buildContent(article, authorId, state, locale) };
  }

  return requestJson(`/articles/${articleId}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export function buildOpenUrl(article: Record<string, any>, { locale }: { locale: string }) {
  if (article.url) return article.url as string;
  const translated = article.translated_content?.[locale];
  if (translated?.url) return translated.url as string;
  return null;
}
