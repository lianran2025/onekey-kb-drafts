import { NextResponse } from 'next/server';
import { requireApiSessionEmail, unauthorizedJson } from '@/lib/simple-auth';
import { getEditableArticle, updateArticle, buildOpenUrl, validateIntercomConfig } from '@/lib/intercom';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await requireApiSessionEmail();
  if (!session) return unauthorizedJson();

  try {
    validateIntercomConfig();
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || process.env.INTERCOM_LOCALE || 'zh-CN';
    const article = await getEditableArticle(id, locale);
    return NextResponse.json({ article });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '读取文章失败' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await requireApiSessionEmail();
  if (!session) return unauthorizedJson();

  try {
    validateIntercomConfig();
    const { id } = await context.params;
    const body = (await request.json()) as {
      draft?: { title?: string; body?: string; html?: string; needsConfirmation?: string[] };
      collectionId?: string;
      locale?: string;
      state?: string;
    };

    if (!body.draft || typeof body.draft !== 'object') {
      return NextResponse.json({ error: 'draft is required' }, { status: 400 });
    }

    const locale = String(body.locale || process.env.INTERCOM_LOCALE || 'zh-CN');
    const state = String(body.state || 'draft');
    const result = await updateArticle({
      articleId: id,
      article: {
        title: String(body.draft.title || ''),
        body: body.draft.body ? String(body.draft.body) : undefined,
        html: body.draft.html ? String(body.draft.html) : undefined,
        needsConfirmation: body.draft.needsConfirmation || [],
      },
      collectionId: String(body.collectionId || '').trim(),
      locale,
      state,
    });

    return NextResponse.json({
      article: result,
      openUrl: buildOpenUrl(result as Record<string, any>, { locale }),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '更新文章失败' },
      { status: 500 }
    );
  }
}
