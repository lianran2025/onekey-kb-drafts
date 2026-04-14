const GITHUB_OWNER = process.env.GITHUB_OWNER || 'lianran2025';
const GITHUB_REPO = process.env.GITHUB_REPO || 'onekey-kb-drafts';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const STORE_PATH = 'data/intercom-review-state.json';

type GitHubContentResponse = {
  sha?: string;
  content?: string;
};

export type ReviewStatus = 'pending' | 'needs_update' | 'no_change_needed' | 'archived';

export type ReviewRecord = {
  articleId: string;
  title?: string;
  collectionId?: string;
  collectionPathLabel?: string;
  updatedAt?: string;
  state?: string;
  publicUrl?: string;
  reviewStatus: ReviewStatus;
  reviewNote: string;
  lastReviewedAt?: string;
  archivedAt?: string;
  createdAt: string;
  updatedRecordAt: string;
};

export type ReviewStore = {
  records: Record<string, ReviewRecord>;
};

function defaultStore(): ReviewStore {
  return { records: {} };
}

function getApiBase() {
  const encodedPath = STORE_PATH.split('/').map(encodeURIComponent).join('/');
  return `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodedPath}`;
}

function getHeaders() {
  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN 未配置，无法保存巡检状态');
  }

  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  };
}

function decodeContent(content?: string) {
  if (!content) return '';
  return Buffer.from(content.replace(/\n/g, ''), 'base64').toString('utf8');
}

function encodeContent(content: string) {
  return Buffer.from(content, 'utf8').toString('base64');
}

async function fetchStoreFile() {
  const apiBase = getApiBase();
  const res = await fetch(`${apiBase}?ref=${encodeURIComponent(GITHUB_BRANCH)}`, {
    method: 'GET',
    headers: getHeaders(),
    cache: 'no-store',
  });

  if (res.status === 404) {
    return { sha: undefined, store: defaultStore() };
  }

  if (!res.ok) {
    throw new Error(`读取 GitHub 巡检状态失败：${await res.text()}`);
  }

  const file = (await res.json()) as GitHubContentResponse;
  const raw = decodeContent(file.content);
  if (!raw.trim()) {
    return { sha: file.sha, store: defaultStore() };
  }

  try {
    const parsed = JSON.parse(raw) as ReviewStore;
    return { sha: file.sha, store: parsed?.records ? parsed : defaultStore() };
  } catch {
    return { sha: file.sha, store: defaultStore() };
  }
}

async function saveStoreFile(store: ReviewStore, sha?: string) {
  const apiBase = getApiBase();
  const payload: Record<string, unknown> = {
    message: 'chore: update intercom review state',
    content: encodeContent(JSON.stringify(store, null, 2)),
    branch: GITHUB_BRANCH,
  };

  if (sha) payload.sha = sha;

  const res = await fetch(apiBase, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`写入 GitHub 巡检状态失败：${await res.text()}`);
  }
}

export async function readReviewStore(): Promise<ReviewStore> {
  const { store } = await fetchStoreFile();
  return store;
}

export async function upsertReviewRecord(input: {
  articleId: string;
  title?: string;
  collectionId?: string;
  collectionPathLabel?: string;
  updatedAt?: string;
  state?: string;
  publicUrl?: string;
  reviewStatus?: ReviewStatus;
  reviewNote?: string;
  markReviewed?: boolean;
}) {
  const now = new Date().toISOString();
  const { sha, store } = await fetchStoreFile();
  const current = store.records[input.articleId];

  const next: ReviewRecord = {
    articleId: input.articleId,
    title: input.title ?? current?.title ?? '',
    collectionId: input.collectionId ?? current?.collectionId ?? '',
    collectionPathLabel: input.collectionPathLabel ?? current?.collectionPathLabel ?? '',
    updatedAt: input.updatedAt ?? current?.updatedAt ?? '',
    state: input.state ?? current?.state ?? '',
    publicUrl: input.publicUrl ?? current?.publicUrl ?? '',
    reviewStatus: input.reviewStatus ?? current?.reviewStatus ?? 'pending',
    reviewNote: input.reviewNote ?? current?.reviewNote ?? '',
    lastReviewedAt: input.markReviewed ? now : current?.lastReviewedAt,
    archivedAt:
      (input.reviewStatus ?? current?.reviewStatus) === 'archived'
        ? current?.archivedAt || now
        : undefined,
    createdAt: current?.createdAt || now,
    updatedRecordAt: now,
  };

  if ((input.reviewStatus ?? current?.reviewStatus) !== 'archived') {
    delete next.archivedAt;
  }

  store.records[input.articleId] = next;
  await saveStoreFile(store, sha);
  return next;
}
