import fs from 'node:fs';
import path from 'node:path';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const filePath = path.join(process.cwd(), 'content', 'kb', `${slug}.md`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }

    fs.unlinkSync(filePath);
    revalidatePath('/');
    revalidatePath('/kb');
    revalidatePath(`/kb/${slug}`);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '删除失败' },
      { status: 500 }
    );
  }
}
