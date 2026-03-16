import { auth, signIn } from '@/auth';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const session = await auth();

  if (session) {
    redirect('/admin');
  }

  return (
    <div className="card">
      <h1 className="h1">管理员登录</h1>
      <p className="muted">仅白名单中的 GitHub 账号可访问后台并执行发布、删除等操作。</p>
      <form
        action={async () => {
          'use server';
          await signIn('github', { redirectTo: '/admin' });
        }}
      >
        <button className="btn" type="submit">
          使用 GitHub 登录
        </button>
      </form>
    </div>
  );
}
