import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const SESSION_COOKIE = 'onekey_kb_session';
const OTP_COOKIE = 'onekey_kb_otp';
const SESSION_MAX_AGE = 30 * 24 * 60 * 60;
const OTP_MAX_AGE = 10 * 60;

function secret() {
  return process.env.AUTH_SECRET || 'dev-only-secret-change-in-vercel';
}

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

function sign(value: string) {
  return crypto.createHmac('sha256', secret()).update(value).digest('hex');
}

function encode(payload: object) {
  const json = JSON.stringify(payload);
  const b64 = Buffer.from(json).toString('base64url');
  const sig = sign(b64);
  return `${b64}.${sig}`;
}

function decode<T>(token?: string | null): T | null {
  if (!token) return null;
  const [b64, sig] = token.split('.');
  if (!b64 || !sig) return null;
  if (sign(b64) !== sig) return null;
  try {
    return JSON.parse(Buffer.from(b64, 'base64url').toString('utf8')) as T;
  } catch {
    return null;
  }
}

export async function getSessionEmail() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const payload = decode<{ email: string; exp: number }>(token);
  if (!payload) return null;
  if (!payload.email || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
  if (!isAllowedEmail(payload.email)) return null;
  return payload.email;
}

export async function requireSessionEmail() {
  const email = await getSessionEmail();
  if (!email) redirect('/login');
  return email;
}

export async function requireApiSessionEmail() {
  return getSessionEmail();
}

export function unauthorizedJson() {
  return NextResponse.json({ error: '未授权' }, { status: 401 });
}

export async function createOtp(email: string) {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const payload = {
    email: email.toLowerCase(),
    code,
    exp: Math.floor(Date.now() / 1000) + OTP_MAX_AGE,
  };
  const token = encode(payload);
  const store = await cookies();
  store.set(OTP_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: OTP_MAX_AGE,
  });
  return code;
}

export async function verifyOtp(inputEmail: string, inputCode: string) {
  const store = await cookies();
  const token = store.get(OTP_COOKIE)?.value;
  const payload = decode<{ email: string; code: string; exp: number }>(token);
  if (!payload) return false;
  const now = Math.floor(Date.now() / 1000);
  const ok =
    payload.exp >= now &&
    payload.email === inputEmail.toLowerCase() &&
    payload.code === inputCode.trim();

  if (!ok) return false;

  store.set(SESSION_COOKIE, encode({ email: payload.email, exp: now + SESSION_MAX_AGE }), {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
  store.delete(OTP_COOKIE);
  return true;
}

export async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(OTP_COOKIE);
}

export async function sendOtpEmail(email: string, code: string) {
  const apiKey = process.env.AUTH_RESEND_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    throw new Error('邮件服务未配置：请检查 AUTH_RESEND_KEY 和 EMAIL_FROM');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: 'OneKey KB 登录验证码',
      html: `<div style="font-family:Arial,sans-serif;line-height:1.7;color:#111"><p>你的 OneKey KB 登录验证码为：</p><p style="font-size:32px;font-weight:700;letter-spacing:4px">${code}</p><p>验证码 10 分钟内有效。</p></div>`,
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`邮件发送失败：${text}`);
  }
}

export async function getRequestSessionEmail(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const payload = decode<{ email: string; exp: number }>(token);
  if (!payload) return null;
  if (payload.exp < Math.floor(Date.now() / 1000)) return null;
  if (!isAllowedEmail(payload.email)) return null;
  return payload.email;
}
