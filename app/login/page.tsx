import { auth, signIn } from '@/auth';
import { redirect } from 'next/navigation';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string }>;
}) {
  const session = await auth();
  if (session) redirect('/admin');

  const params = await searchParams;
  const verified = params.verified === '1';

  return (
    <div className="login-shell">
      <div className="login-card glass-card">
        <span className="homepage-eyebrow">Private Workspace</span>
        <h1 className="login-title">邮箱验证后进入知识库后台</h1>
        <p className="login-subtitle">
          只有白名单邮箱可以访问该系统。输入你的邮箱后，系统会发送一封登录邮件，验证通过后将直接进入后台文章页面。
        </p>

        <form
          className="login-form"
          action={async (formData) => {
            'use server';
            const email = String(formData.get('email') || '').trim();
            await signIn('resend', {
              email,
              redirectTo: '/admin',
            });
          }}
        >
          <label className="publish-label">
            <span>邮箱地址</span>
            <input className="publish-select" type="email" name="email" placeholder="you@example.com" required />
          </label>
          <button className="btn" type="submit">发送验证邮件</button>
        </form>

        {verified ? <p className="muted">验证成功，正在跳转后台…</p> : null}
      </div>
    </div>
  );
}
