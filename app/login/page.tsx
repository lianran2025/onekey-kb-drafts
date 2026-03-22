'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const sendCode = async () => {
    setLoading(true);
    setStatus('');
    try {
      const res = await fetch('/api/auth/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || '发送失败');
      setStep('code');
      setStatus(data?.message || '验证码已发送');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '发送失败');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setLoading(true);
    setStatus('');
    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || '验证失败');
      window.location.href = '/admin';
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '验证失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-card glass-card">
        <span className="homepage-eyebrow">Private Workspace</span>
        <h1 className="login-title">邮箱验证码登录</h1>
        <p className="login-subtitle">
          只有白名单邮箱可以访问该系统。先输入邮箱获取验证码，再输入验证码进入知识库后台。
        </p>

        <div className="login-form">
          <label className="publish-label">
            <span>邮箱地址</span>
            <input
              className="publish-select"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={step === 'code'}
            />
          </label>

          {step === 'code' ? (
            <label className="publish-label">
              <span>验证码</span>
              <input
                className="publish-select"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="请输入 6 位验证码"
                required
              />
            </label>
          ) : null}

          <div className="row">
            {step === 'email' ? (
              <button className="btn" type="button" onClick={sendCode} disabled={loading || !email.trim()}>
                {loading ? '发送中...' : '发送验证码'}
              </button>
            ) : (
              <>
                <button className="btn" type="button" onClick={verifyCode} disabled={loading || !code.trim()}>
                  {loading ? '验证中...' : '验证并进入后台'}
                </button>
                <button className="btn btn-ghost" type="button" onClick={() => setStep('email')} disabled={loading}>
                  返回上一步
                </button>
              </>
            )}
          </div>
        </div>

        {status ? <p className="muted">{status}</p> : null}
      </div>
    </div>
  );
}
