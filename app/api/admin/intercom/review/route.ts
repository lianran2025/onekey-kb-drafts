import { NextResponse } from 'next/server';
import { requireApiSessionEmail, unauthorizedJson } from '@/lib/simple-auth';
import { getReviewRecord, listReviewItems, upsertReviewRecord, type ReviewStatus } from '@/lib/review-store';

export const dynamic = 'force-dynamic';

function normalizeQuery(value: string) {
  return value.trim().toLowerCase();
}

export async function GET(request: Request) {
  const email = await requireApiSessionEmail();
  if (!email) return unauthorizedJson();

  try {
    const url = new URL(request.url);
    const statusFilter = url.searchParams.get('status') || '';
    const query = normalizeQuery(url.searchParams.get('query') || '');
    const staleDays = Number(url.searchParams.get('staleDays') || '90');
    const collectionId = url.searchParams.get('collectionId') || '';

    const result = await listReviewItems({
      status: statusFilter,
      query,
      staleDays,
      collectionId,
      includeFilterOptions: true,
    });

    if (Array.isArray(result)) {
      return NextResponse.json({ items: result, filterOptions: [] });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '读取巡检列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const email = await requireApiSessionEmail();
  if (!email) return unauthorizedJson();

  try {
    const body = await request.json();
    const articleId = String(body?.articleId || '').trim();
    const reviewStatus = String(body?.reviewStatus || '').trim() as ReviewStatus;
    const reviewNote = String(body?.reviewNote || '');

    if (!articleId) {
      return NextResponse.json({ error: 'articleId is required' }, { status: 400 });
    }

    const current = await getReviewRecord(articleId);
    const record = await upsertReviewRecord({
      articleId,
      title: current?.title || '',
      collectionId: current?.collectionId || '',
      collectionPathLabel: current?.collectionPathLabel || '',
      updatedAt: current?.updatedAt || '',
      state: current?.state || '',
      publicUrl: current?.publicUrl || '',
      reviewStatus: reviewStatus || undefined,
      reviewNote,
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
