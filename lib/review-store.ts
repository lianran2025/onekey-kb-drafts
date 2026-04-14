import fs from 'fs';
import path from 'path';

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

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_PATH = path.join(DATA_DIR, 'intercom-review-state.json');

function ensureStoreDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function defaultStore(): ReviewStore {
  return { records: {} };
}

export function readReviewStore(): ReviewStore {
  ensureStoreDir();
  if (!fs.existsSync(STORE_PATH)) return defaultStore();

  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    if (!raw.trim()) return defaultStore();
    const parsed = JSON.parse(raw) as ReviewStore;
    return parsed?.records ? parsed : defaultStore();
  } catch {
    return defaultStore();
  }
}

export function writeReviewStore(store: ReviewStore) {
  ensureStoreDir();
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
}

export function upsertReviewRecord(input: {
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
  const store = readReviewStore();
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
  writeReviewStore(store);
  return next;
}
