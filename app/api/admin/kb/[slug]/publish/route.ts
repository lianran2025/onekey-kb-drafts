import { getArticle } from '@/lib/kb';
import { buildOpenUrl, publishArticle, validateIntercomConfig } from '@/lib/intercom';
import { NextResponse } from 'next/server';
import { requireAdminApiSession, unauthorizedJson } from '@/lib/auth-guard';

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const session = await requireAdminApiSession();
  if (!session) return unauthorizedJson();

  try {
    validateIntercomConfig();

    const body = (await request.json().catch(() => ({}))) as { collectionId?: string; state?: string; locale?: string };
    const collectionId = String(body.collectionId || '').trim();
    const state = String(body.state || 'draft');
    const locale = String(body.locale || process.env.INTERCOM_LOCALE || 'zh-CN');

    if (!collectionId) {
      return NextResponse.json({ error: 'collectionId is required' }, { status: 400 });
    }

    const { slug } = await context.params;
    const article = getArticle(slug);

    const result = await publishArticle({
      article: {
        title: article.frontmatter.title,
        html: article.html,
        needsConfirmation: [],
      },
      collectionId,
      locale,
      state,
    });

    return NextResponse.json({
      ok: true,
      article: result,
      openUrl: buildOpenUrl(result as Record<string, any>, { locale }),
      message: '发布成功',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '发布失败' },
      { status: 500 }
    );
  }
}
