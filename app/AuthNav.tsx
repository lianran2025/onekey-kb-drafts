'use client';

export function AuthNav() {
  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <nav className="nav row nav-minimal">
      <button className="btn btn-small" type="button" onClick={logout}>
        退出
      </button>
    </nav>
  );
}
