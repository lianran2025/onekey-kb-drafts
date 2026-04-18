import { getSupabaseAdmin } from '@/lib/supabase-admin';

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

type ReviewRow = {
  article_id: string;
  review_status: ReviewStatus;
  review_note: string | null;
  last_reviewed_at: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

type ArticleRow = {
  article_id: string;
  title: string | null;
  collection_id: string | null;
  collection_path_label: string | null;
  state: string | null;
  public_url: string | null;
  updated_at: string | null;
  synced_at: string | null;
};

function mapReviewRowToRecord(row: ReviewRow, article?: ArticleRow): ReviewRecord {
  return {
    articleId: row.article_id,
    title: article?.title || '',
    collectionId: article?.collection_id || '',
    collectionPathLabel: article?.collection_path_label || '',
    updatedAt: article?.updated_at || '',
    state: article?.state || '',
    publicUrl: article?.public_url || '',
    reviewStatus: row.review_status,
    reviewNote: row.review_note || '',
    lastReviewedAt: row.last_reviewed_at || '',
    archivedAt: row.archived_at || '',
    createdAt: row.created_at,
    updatedRecordAt: row.updated_at,
  };
}

export async function readReviewStore(): Promise<ReviewStore> {
  const supabase = getSupabaseAdmin();
  const [{ data: reviews, error: reviewsError }, { data: articles, error: articlesError }] = await Promise.all([
    supabase.from('intercom_article_reviews').select('*'),
    supabase.from('intercom_articles').select('*'),
  ]);

  if (reviewsError) throw new Error(`读取巡检状态失败：${reviewsError.message}`);
  if (articlesError) throw new Error(`读取文章元数据失败：${articlesError.message}`);

  const articleMap = new Map<string, ArticleRow>((articles || []).map((item) => [item.article_id, item as ArticleRow]));
  const records: Record<string, ReviewRecord> = {};

  for (const item of (reviews || []) as ReviewRow[]) {
    records[item.article_id] = mapReviewRowToRecord(item, articleMap.get(item.article_id));
  }

  return { records };
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
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  const { data: articleRows, error: articleReadError } = await supabase
    .from('intercom_articles')
    .select('*')
    .eq('article_id', input.articleId)
    .limit(1);

  if (articleReadError) throw new Error(`读取文章元数据失败：${articleReadError.message}`);

  const currentArticle = (articleRows?.[0] || null) as ArticleRow | null;

  const articlePayload = {
    article_id: input.articleId,
    title: input.title ?? currentArticle?.title ?? '',
    collection_id: input.collectionId ?? currentArticle?.collection_id ?? '',
    collection_path_label: input.collectionPathLabel ?? currentArticle?.collection_path_label ?? '',
    state: input.state ?? currentArticle?.state ?? '',
    public_url: input.publicUrl ?? currentArticle?.public_url ?? '',
    updated_at: input.updatedAt ?? currentArticle?.updated_at ?? null,
    synced_at: now,
  };

  const { error: articleUpsertError } = await supabase.from('intercom_articles').upsert(articlePayload, {
    onConflict: 'article_id',
  });

  if (articleUpsertError) throw new Error(`保存文章元数据失败：${articleUpsertError.message}`);

  const reviewPayload = {
    article_id: input.articleId,
    review_status: input.reviewStatus ?? 'pending',
    review_note: input.reviewNote ?? '',
    last_reviewed_at: input.markReviewed ? now : null,
    archived_at: (input.reviewStatus ?? 'pending') === 'archived' ? now : null,
    updated_at: now,
  };

  const { error: reviewUpsertError } = await supabase.from('intercom_article_reviews').upsert(reviewPayload, {
    onConflict: 'article_id',
  });

  if (reviewUpsertError) throw new Error(`保存巡检状态失败：${reviewUpsertError.message}`);

  return {
    articleId: input.articleId,
    title: articlePayload.title || '',
    collectionId: articlePayload.collection_id || '',
    collectionPathLabel: articlePayload.collection_path_label || '',
    updatedAt: articlePayload.updated_at || '',
    state: articlePayload.state || '',
    publicUrl: articlePayload.public_url || '',
    reviewStatus: reviewPayload.review_status,
    reviewNote: reviewPayload.review_note || '',
    lastReviewedAt: reviewPayload.last_reviewed_at || '',
    archivedAt: reviewPayload.archived_at || '',
    createdAt: now,
    updatedRecordAt: now,
  } as ReviewRecord;
}

export async function upsertArticles(items: Array<{
  articleId: string;
  title: string;
  collectionId: string;
  collectionPathLabel: string;
  state: string;
  publicUrl: string;
  updatedAt: string;
}>) {
  if (items.length === 0) {
    return { count: 0 };
  }

  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const payload = items.map((item) => ({
    article_id: item.articleId,
    title: item.title,
    collection_id: item.collectionId,
    collection_path_label: item.collectionPathLabel,
    state: item.state,
    public_url: item.publicUrl,
    updated_at: item.updatedAt || null,
    synced_at: now,
  }));

  const { error } = await supabase.from('intercom_articles').upsert(payload, {
    onConflict: 'article_id',
  });

  if (error) throw new Error(`同步文章到 Supabase 失败：${error.message}`);
  return { count: payload.length };
}
