import { getCollections, validateIntercomConfig } from '@/lib/intercom';
import { NextResponse } from 'next/server';
import { requireApiSessionEmail, unauthorizedJson } from '@/lib/simple-auth';

export async function GET() {
  const session = await requireApiSessionEmail();
  if (!session) return unauthorizedJson();

  try {
    validateIntercomConfig();
    const locale = process.env.INTERCOM_LOCALE || 'zh-CN';
    const collections = await getCollections(locale);
    return NextResponse.json({ collections });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '读取 collection 失败' },
      { status: 500 }
    );
  }
}
