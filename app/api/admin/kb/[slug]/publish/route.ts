import { auth } from '@/auth';
import { getArticle } from '@/lib/kb';
import { NextResponse } from 'next/server';

export async function POST(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  const publishWebhook = process.env.INTERCOM_PUBLISH_WEBHOOK_URL;

  if (!publishWebhook) {
    return NextResponse.json(
      {
        error:
          '尚未配置 INTERCOM_PUBLISH_WEBHOOK_URL。请先把你已验证的发布逻辑接入该接口，或提供发布代码让我继续接入。',
      },
      { status: 400 }
    );
  }

  try {
    const { slug } = await context.params;
    const article = getArticle(slug);

    const payload = {
      slug,
      title: article.frontmatter.title,
      description: article.frontmatter.description,
      html: article.html,
      markdown: article.markdown,
      tags: article.frontmatter.tags || [],
      createdAt: article.frontmatter.createdAt,
      sources: article.frontmatter.sources || [],
    };

    const res = await fetch(publishWebhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.INTERCOM_PUBLISH_WEBHOOK_TOKEN
          ? { Authorization: `Bearer ${process.env.INTERCOM_PUBLISH_WEBHOOK_TOKEN}` }
          : {}),
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `发布失败：${await res.text()}` },
        { status: 500 }
      );
    }

    const data = await res.json().catch(() => null);
    return NextResponse.json({
      ok: true,
      message: data?.message || '已调用发布接口',
      data,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '发布失败' },
      { status: 500 }
    );
  }
}
