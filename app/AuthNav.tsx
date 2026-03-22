'use client';

import { SessionProvider, signIn, signOut, useSession } from 'next-auth/react';

function AuthNavInner() {
  const { data: session, status } = useSession();

  const isLoggedIn = status === 'authenticated' && !!session;

  return (
    <nav className="nav row">
      <a href="/">文章列表</a>
      {isLoggedIn ? <a href="/admin">后台</a> : <a href="/login">登录</a>}
      {isLoggedIn ? (
        <button
          className="btn btn-small"
          type="button"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          退出
        </button>
      ) : (
        <button
          className="btn btn-small"
          type="button"
          onClick={() => signIn('github', { callbackUrl: '/admin' })}
        >
          GitHub 登录
        </button>
      )}
    </nav>
  );
}

export function AuthNav() {
  return (
    <SessionProvider>
      <AuthNavInner />
    </SessionProvider>
  );
}
