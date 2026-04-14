import { NextResponse } from 'next/server';
import { requireAdminApiSession, unauthorizedJson } from '@/lib/auth-guard';
import { getEditableArticle, getCollections, buildOpenUrl } from '@/lib/intercom';
import { readReviewStore, upsertReviewRecord, type ReviewStatus } from '@/lib/review-store';

export const dynamic = 'force-dynamic';

function normalizeQuery(value: string) {
  return value.trim().toLowerCase();
}

export async function GET(request: Request) {
  const session = await requireAdminApiSession();
  if (!session) return unauthorizedJson();

  try {
    const url = new URL(request.url);
    const locale = url.searchParams.get('locale') || process.env.INTERCOM_LOCALE || 'zh-CN';
    const statusFilter = url.searchParams.get('status') || '';
    const query = normalizeQuery(url.searchParams.get('query') || '');

    const collections = await getCollections(locale);
    const store = readReviewStore();
    const items = Object.values(store.records)
      .filter((item) => (statusFilter ? item.reviewStatus === statusFilter : item.reviewStatus !== 'archived'))
      .filter((item) => {
        if (!query) return true;
        return [item.title, item.articleId, item.collectionPathLabel, item.reviewNote]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));
      })
      .sort((left, right) => {
        const a = left.updatedAt || '';
        const b = right.updatedAt || '';
        return a.localeCompare(b);
      })
      .map((item) => ({
        ...item,
        collectionName:
          collections.find((collection) => collection.id === item.collectionId)?.name || item.collectionPathLabel || '',
      }));

    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '读取巡检列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await requireAdminApiSession();
  if (!session) return unauthorizedJson();

  try {
    const locale = process.env.INTERCOM_LOCALE || 'zh-CN';
    const body = await request.json();
    const articleId = String(body?.articleId || '').trim();
    const reviewStatus = String(body?.reviewStatus || '').trim() as ReviewStatus;
    const reviewNote = String(body?.reviewNote || '');

    if (!articleId) {
      return NextResponse.json({ error: 'articleId is required' }, { status: 400 });
    }

    const article = await getEditableArticle(articleId, locale);
    const collections = await getCollections(locale);
    const collection = collections.find((item) => item.id === article.collectionId);

    const record = upsertReviewRecord({
      articleId,
      title: article.title,
      collectionId: article.collectionId,
      collectionPathLabel: collection?.pathLabel || '',
      reviewStatus: reviewStatus || undefined,
      reviewNote,
      state: article.state,
      publicUrl: buildOpenUrl(article as any, { locale }) || '',
      markReviewed: true,
    });

    return NextResponse.json({ record });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '保存巡检结果失败' },
      { status: 500 }
    );
  }
}
