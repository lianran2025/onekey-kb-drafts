import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { requireAdminApiSession, unauthorizedJson } from '@/lib/auth-guard';

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

  if (getRes.status === 404) throw new Error('文章不存在');
  if (!getRes.ok) throw new Error(`读取 GitHub 文件失败：${await getRes.text()}`);

  const file = (await getRes.json()) as { sha?: string };
  if (!file.sha) throw new Error('未获取到文件 SHA，无法删除');

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
  if (!fs.existsSync(filePath)) throw new Error('文章不存在');
  fs.unlinkSync(filePath);
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const session = await requireAdminApiSession();
  if (!session) return unauthorizedJson();

  try {
    const { slug } = await context.params;
    if (GITHUB_TOKEN) {
      await deleteFromGitHub(slug);
    } else {
      deleteLocal(slug);
    }

    revalidatePath('/');
    revalidatePath('/kb');
    revalidatePath('/admin');
    revalidatePath(`/kb/${slug}`);
    revalidatePath(`/admin/kb/${slug}`);

    return NextResponse.json({ ok: true, mode: GITHUB_TOKEN ? 'github' : 'local' });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '删除失败' },
      { status: 500 }
    );
  }
}
