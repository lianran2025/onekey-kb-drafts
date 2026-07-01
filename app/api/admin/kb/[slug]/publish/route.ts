import { getArticle } from '@/lib/kb';
import {
  buildOpenUrl,
  getEditableArticle,
  getIntercomPublishHtml,
  publishArticle,
  validateIntercomConfig,
  validateIntercomHtml,
} from '@/lib/intercom';
import { NextResponse } from 'next/server';
import { requireApiSessionEmail, unauthorizedJson } from '@/lib/simple-auth';

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const session = await requireApiSessionEmail();
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
    const publishHtml = getIntercomPublishHtml(article.html);

    if (!publishHtml.validation.ok) {
      return NextResponse.json(
        {
          error: '文章包含 Intercom 不兼容的 HTML 结构，请先修复后再发布',
          validation: publishHtml.validation,
        },
        { status: 400 }
      );
    }

    const result = await publishArticle({
      article: {
        title: article.frontmatter.title,
        html: publishHtml.html,
        needsConfirmation: [],
      },
      collectionId,
      locale,
      state,
    });

    const resultRecord = result as Record<string, any>;
    const articleId = String(resultRecord.id || '');
    let readBackValidation = null;
    let readBackError = '';
    if (articleId) {
      try {
        const readBack = await getEditableArticle(articleId, locale);
        readBackValidation = validateIntercomHtml(readBack.html);
      } catch (error) {
        readBackError = error instanceof Error ? error.message : '回读 Intercom 文章失败';
      }
    }

    return NextResponse.json({
      ok: true,
      article: result,
      openUrl: buildOpenUrl(result as Record<string, any>, { locale }),
      validation: publishHtml.validation,
      readBackValidation,
      readBackError,
      message: '发布成功',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '发布失败' },
      { status: 500 }
    );
  }
}
