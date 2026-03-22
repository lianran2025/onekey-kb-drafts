import { NextResponse } from 'next/server';
import { clearSession } from '@/lib/simple-auth';

export async function POST() {
  await clearSession();
  return NextResponse.json({ ok: true });
}
