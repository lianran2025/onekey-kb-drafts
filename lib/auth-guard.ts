import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';

export function getAllowedEmails() {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedEmail(email?: string | null) {
  if (!email) return false;
  return getAllowedEmails().includes(String(email).toLowerCase());
}

export async function requireAdminSession() {
  const session = await auth();
  const email = session?.user?.email;

  if (!session || !isAllowedEmail(email)) {
    redirect('/login');
  }

  return session;
}

export async function requireAdminApiSession() {
  const session = await auth();
  const email = session?.user?.email;

  if (!session || !isAllowedEmail(email)) {
    return null;
  }

  return session;
}

export function unauthorizedJson() {
  return NextResponse.json({ error: '未授权' }, { status: 401 });
}
