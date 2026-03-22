import { NextResponse } from 'next/server';
import { isAllowedEmail, verifyOtp } from '@/lib/simple-auth';

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { email?: string; code?: string };
    const email = String(body.email || '').trim().toLowerCase();
    const code = String(body.code || '').trim();

    if (!email || !code) {
      return NextResponse.json({ error: '请输入邮箱和验证码' }, { status: 400 });
    }

    if (!isAllowedEmail(email)) {
      return NextResponse.json({ error: '该邮箱没有访问权限' }, { status: 403 });
    }

    const ok = await verifyOtp(email, code);
    if (!ok) {
      return NextResponse.json({ error: '验证码无效或已过期' }, { status: 401 });
    }

    return NextResponse.json({ ok: true, message: '验证成功' });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '验证失败' },
      { status: 500 }
    );
  }
}
