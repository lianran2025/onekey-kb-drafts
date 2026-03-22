import { NextResponse } from 'next/server';
import { createOtp, isAllowedEmail, sendOtpEmail } from '@/lib/simple-auth';

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { email?: string };
    const email = String(body.email || '').trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: '请输入邮箱地址' }, { status: 400 });
    }

    if (!isAllowedEmail(email)) {
      return NextResponse.json({ error: '该邮箱没有访问权限' }, { status: 403 });
    }

    const code = await createOtp(email);
    await sendOtpEmail(email, code);

    return NextResponse.json({ ok: true, message: '验证码已发送，请查收邮箱' });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '验证码发送失败' },
      { status: 500 }
    );
  }
}
