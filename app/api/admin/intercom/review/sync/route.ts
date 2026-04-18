import { NextResponse } from 'next/server';
import { requireApiSessionEmail, unauthorizedJson } from '@/lib/simple-auth';
import { listArticles } from '@/lib/intercom';
import { upsertArticles } from '@/lib/review-store';

export const dynamic = 'force-dynamic';

export async function POST() {
  const email = await requireApiSessionEmail();
  if (!email) return unauthorizedJson();

  try {
    const locale = process.env.INTERCOM_LOCALE || 'zh-CN';
    const articles = await listArticles(locale);
    const result = await upsertArticles(
      articles.map((item) => ({
        articleId: item.id,
        title: item.title,
        collectionId: item.collectionId,
        collectionPathLabel: item.collectionPathLabel,
        state: item.state,
        publicUrl: item.publicUrl,
        updatedAt: item.updatedAt,
      }))
    );

    return NextResponse.json({ ok: true, count: result.count, message: `已同步 ${result.count} 篇文章` });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '同步 Intercom 文章失败' },
      { status: 500 }
    );
  }
}
