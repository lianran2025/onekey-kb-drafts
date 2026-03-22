export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string; error?: string }>;
}) {
  const params = await searchParams;
  const verified = params.verified === '1';
  const error = params.error;

  return (
    <div className="login-shell">
      <div className="login-card glass-card">
        <span className="homepage-eyebrow">Private Workspace</span>
        <h1 className="login-title">邮箱验证后进入知识库后台</h1>
        <p className="login-subtitle">
          只有白名单邮箱可以访问该系统。输入你的邮箱后，系统会发送一封登录邮件，验证通过后将直接进入后台文章页面。
        </p>

        <form className="login-form" method="post" action="/api/auth/signin/resend">
          <input type="hidden" name="callbackUrl" value="/admin" />
          <label className="publish-label">
            <span>邮箱地址</span>
            <input className="publish-select" type="email" name="email" placeholder="you@example.com" required />
          </label>
          <button className="btn" type="submit">发送验证邮件</button>
        </form>

        {verified ? <p className="muted">验证成功，正在跳转后台…</p> : null}
        {error ? <p className="muted">登录失败：{error}</p> : null}
      </div>
    </div>
  );
}
