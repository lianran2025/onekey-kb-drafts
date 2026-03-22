import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { requireApiSessionEmail, unauthorizedJson } from '@/lib/simple-auth';

const GITHUB_OWNER = process.env.GITHUB_OWNER || 'lianran2025';
const GITHUB_REPO = process.env.GITHUB_REPO || 'onekey-kb-drafts';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

async function deleteFromGitHub(slug: string) {
  const contentPath = `content/kb/${slug}.md`;
  const encodedPath = contentPath.split('/').map(encodeURIComponent).join('/');
  const apiBase = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodedPath}`;

  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    'X-GitHub-Api-Version': '2022-11-28',
  };

  const getRes = await fetch(`${apiBase}?ref=${encodeURIComponent(GITHUB_BRANCH)}`, {
    method: 'GET',
    headers,
    cache: 'no-store',
  });

  if (getRes.status === 404) throw new Error(`文章不存在：${slug}`);
  if (!getRes.ok) throw new Error(`读取 GitHub 文件失败：${await getRes.text()}`);

  const file = (await getRes.json()) as { sha?: string };
  if (!file.sha) throw new Error(`未获取到文件 SHA：${slug}`);

  const deleteRes = await fetch(apiBase, {
    method: 'DELETE',
    headers,
    body: JSON.stringify({
      message: `docs: delete ${slug}`,
      sha: file.sha,
      branch: GITHUB_BRANCH,
    }),
  });

  if (!deleteRes.ok) throw new Error(`删除 GitHub 文件失败：${await deleteRes.text()}`);
}

function deleteLocal(slug: string) {
  const filePath = path.join(process.cwd(), 'content', 'kb', `${slug}.md`);
  if (!fs.existsSync(filePath)) throw new Error(`文章不存在：${slug}`);
  fs.unlinkSync(filePath);
}

export async function POST(request: Request) {
  const session = await requireApiSessionEmail();
  if (!session) return unauthorizedJson();

  try {
    const body = (await request.json()) as { slugs?: string[] };
    const slugs = (body.slugs || []).filter(Boolean);

    if (slugs.length === 0) {
      return NextResponse.json({ error: '请先选择文章' }, { status: 400 });
    }

    for (const slug of slugs) {
      if (GITHUB_TOKEN) {
        await deleteFromGitHub(slug);
      } else {
        deleteLocal(slug);
      }
      revalidatePath(`/kb/${slug}`);
      revalidatePath(`/admin/kb/${slug}`);
    }

    revalidatePath('/');
    revalidatePath('/kb');
    revalidatePath('/admin');

    return NextResponse.json({
      ok: true,
      count: slugs.length,
      message: `已删除 ${slugs.length} 篇文章`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '批量删除失败' },
      { status: 500 }
    );
  }
}
