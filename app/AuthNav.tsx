'use client';

import { SessionProvider, signOut, useSession } from 'next-auth/react';

function AuthNavInner() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated' && !!session;

  return (
    <nav className="nav row">
      {isLoggedIn ? <a href="/admin">后台</a> : null}
      {isLoggedIn ? (
        <button
          className="btn btn-small"
          type="button"
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          退出
        </button>
      ) : null}
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
