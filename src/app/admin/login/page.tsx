'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/cms/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        setError('Invalid password');
        return;
      }

      sessionStorage.setItem('admin_token', password);
      router.push('/admin');
      router.refresh();
    } catch {
      setError('Could not sign in. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: 'var(--ink-black)', color: 'var(--parchment)' }}>
      <form onSubmit={handleSubmit} className="w-full max-w-sm p-8" style={{ border: '1px solid var(--rule-color)' }}>
        <p className="font-serif-display mb-2" style={{ fontSize: '1.7rem', color: 'var(--faded-gold)', fontStyle: 'italic', letterSpacing: '0.1em' }}>
          SERBERO INK
        </p>
        <p className="font-mono-body mb-8" style={{ fontSize: '0.62rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(200,169,110,0.6)' }}>
          Admin
        </p>

        <label className="font-mono-body block mb-2" style={{ fontSize: '0.58rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(200,169,110,0.7)' }}>
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-3 mb-4 font-mono-body"
          style={{ background: 'rgba(240,234,214,0.05)', border: '1px solid rgba(200,169,110,0.3)', color: 'var(--parchment)' }}
        />

        {error && (
          <p className="font-mono-body mb-4" style={{ fontSize: '0.62rem', color: 'rgba(220,100,100,0.95)' }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 font-mono-body"
          style={{ fontSize: '0.62rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--ink-black)', backgroundColor: 'var(--faded-gold)', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
