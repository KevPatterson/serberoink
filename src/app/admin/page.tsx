'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  getAnalyticsSummary,
  clearAnalytics,
  type AnalyticsSummary,
} from '@/lib/analytics';

const ADMIN_PASSWORD = 'serberoink2024';
const SESSION_KEY = 'serbero_admin_auth';

interface ContentData {
  heroLabel: string;
  heroTagline: string;
  aboutHeading: string;
  aboutBio1: string;
  aboutBio2: string;
  aboutQuote: string;
  aboutLocation: string;
  bookingEmail: string;
  bookingInstagram: string;
  bookingLocation: string;
  whatsappNumber: string;
}

const defaultContent: ContentData = {
  heroLabel: 'Tattoo Studio — Est. 2024',
  heroTagline: '"permanent art. no regrets."',
  aboutHeading: 'The Hand Behind the Needle.',
  aboutBio1: 'Born from a city that doesn\'t sleep and a tradition that doesn\'t forget, Serbero has spent over a decade turning skin into story.',
  aboutBio2: 'The studio operates by appointment only. No walk-ins. No rush.',
  aboutQuote: '"Every line is intentional."',
  aboutLocation: 'New York, NY',
  bookingEmail: 'studio@serberoink.com',
  bookingInstagram: '@serbero_ink',
  bookingLocation: 'New York, NY — by appointment',
  whatsappNumber: '1234567890',
};

const galleryPlaceholders = [
  { id: 1, label: 'Serpent Study, 2025' },
  { id: 2, label: 'Botanical Sleeve Detail, 2025' },
  { id: 3, label: 'Geometric Chest Piece, 2024' },
  { id: 4, label: 'Moth & Dagger, 2024' },
  { id: 5, label: 'Rose Flash, 2025' },
  { id: 6, label: 'Skull Study, 2025' },
  { id: 7, label: 'Compass & Stars, 2024' },
];

type Tab = 'content' | 'gallery' | 'contact' | 'analytics';
type SaveState = 'idle' | 'loading' | 'success' | 'error';

/* ── Login Screen ── */
function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate brief validation delay for UX
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      onLogin();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: 'var(--ink-black)', color: 'var(--parchment)' }}
    >
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
          opacity: 0.35,
          zIndex: 0,
        }}
      />
      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-12">
          <p className="font-serif-display" style={{ fontSize: '2rem', fontWeight: 900, fontStyle: 'italic', color: 'var(--faded-gold)', letterSpacing: '0.12em', marginBottom: '0.4rem' }}>
            SERBERO INK
          </p>
          <p className="font-mono-body" style={{ fontSize: '0.55rem', letterSpacing: '0.45em', textTransform: 'uppercase', color: 'rgba(200,169,110,0.45)' }}>
            Admin Access
          </p>
        </div>
        <div style={{ borderTop: '1px solid var(--rule-color)', marginBottom: '2.5rem' }} />
        <form onSubmit={handleSubmit} style={{ animation: shake ? 'shake 0.4s ease' : 'none' }}>
          <div className="mb-6">
            <label className="font-mono-body block mb-2" style={{ fontSize: '0.58rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(200,169,110,0.65)' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              disabled={loading}
              className="font-mono-body w-full px-4 py-3"
              style={{
                fontSize: '0.85rem',
                background: 'rgba(240,234,214,0.04)',
                border: `1px solid ${error ? 'rgba(180,60,60,0.7)' : 'rgba(200,169,110,0.25)'}`,
                color: 'var(--parchment)',
                outline: 'none',
                letterSpacing: '0.15em',
                transition: 'border-color 0.2s ease',
                opacity: loading ? 0.6 : 1,
              }}
              onFocus={(e) => { if (!error) e.currentTarget.style.borderColor = 'rgba(200,169,110,0.6)'; }}
              onBlur={(e) => { if (!error) e.currentTarget.style.borderColor = 'rgba(200,169,110,0.25)'; }}
              placeholder="Enter password"
            />
            {error && (
              <p className="font-mono-body mt-2" style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: 'rgba(200,80,80,0.85)', textTransform: 'uppercase' }}>
                ✗ Incorrect password
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="font-mono-body w-full py-3 flex items-center justify-center gap-2"
            style={{
              fontSize: '0.65rem',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              color: 'var(--ink-black)',
              backgroundColor: 'var(--faded-gold)',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s ease',
              opacity: loading ? 0.8 : 1,
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--parchment)'; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--faded-gold)'; }}
          >
            {loading ? (
              <>
                <span style={{ display: 'inline-block', width: '10px', height: '10px', border: '1.5px solid var(--ink-black)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                Verifying…
              </>
            ) : 'Enter Panel'}
          </button>
        </form>
        <div className="text-center mt-8">
          <Link href="/homepage" className="font-mono-body" style={{ fontSize: '0.58rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(240,234,214,0.3)', textDecoration: 'none', transition: 'color 0.2s ease' }}>
            ← Back to Site
          </Link>
        </div>
      </div>
      <style>{`
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)} }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

/* ── Analytics Dashboard ── */
function AnalyticsDashboard() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [cleared, setCleared] = useState(false);

  const load = useCallback(() => {
    setSummary(getAnalyticsSummary());
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleClear = () => {
    clearAnalytics();
    setCleared(true);
    load();
    setTimeout(() => setCleared(false), 2500);
  };

  if (!summary) return null;

  const maxDaily = Math.max(...summary.dailyViews.map((d) => d.count), 1);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <SectionLabel>Analytics Overview</SectionLabel>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        {[
          { label: 'Page Views', value: summary.totalPageviews },
          { label: 'Section Visits', value: summary.totalSectionVisits },
          { label: 'CTA Clicks', value: summary.totalCtaClicks },
        ].map((stat) => (
          <div key={stat.label} className="p-4 text-center" style={{ border: '1px solid var(--rule-color)' }}>
            <p className="font-serif-display" style={{ fontSize: 'clamp(1.4rem, 3vw, 2.2rem)', fontWeight: 900, fontStyle: 'italic', color: 'var(--faded-gold)', lineHeight: 1 }}>
              {stat.value}
            </p>
            <p className="font-mono-body mt-2" style={{ fontSize: '0.55rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(240,234,214,0.4)' }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Daily views bar chart — last 14 days */}
      <div className="mb-10">
        <p className="font-mono-body mb-4" style={{ fontSize: '0.58rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(200,169,110,0.55)' }}>
          Page Views — Last 14 Days
        </p>
        <div className="flex items-end gap-1" style={{ height: '80px' }}>
          {summary.dailyViews.map((day) => (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group" title={`${formatDate(day.date)}: ${day.count}`}>
              <div
                style={{
                  width: '100%',
                  height: `${Math.max((day.count / maxDaily) * 64, day.count > 0 ? 4 : 1)}px`,
                  backgroundColor: day.count > 0 ? 'var(--faded-gold)' : 'rgba(200,169,110,0.12)',
                  transition: 'height 0.3s ease',
                  alignSelf: 'flex-end',
                }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="font-mono-body" style={{ fontSize: '0.52rem', color: 'rgba(240,234,214,0.3)', letterSpacing: '0.1em' }}>
            {formatDate(summary.dailyViews[0]?.date ?? '')}
          </span>
          <span className="font-mono-body" style={{ fontSize: '0.52rem', color: 'rgba(240,234,214,0.3)', letterSpacing: '0.1em' }}>
            Today
          </span>
        </div>
      </div>

      {/* Top sections + CTAs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Top sections */}
        <div>
          <p className="font-mono-body mb-4" style={{ fontSize: '0.58rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(200,169,110,0.55)' }}>
            Top Sections
          </p>
          {summary.topSections.length === 0 ? (
            <p className="font-mono-body" style={{ fontSize: '0.68rem', color: 'rgba(240,234,214,0.3)', fontStyle: 'italic' }}>No data yet</p>
          ) : (
            summary.topSections.map((s) => (
              <div key={s.label} className="flex items-center justify-between mb-3">
                <div className="flex-1 mr-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono-body" style={{ fontSize: '0.65rem', color: 'var(--parchment)', letterSpacing: '0.05em' }}>{s.label}</span>
                    <span className="font-mono-body" style={{ fontSize: '0.62rem', color: 'var(--faded-gold)' }}>{s.count}</span>
                  </div>
                  <div style={{ height: '2px', background: 'rgba(200,169,110,0.12)', borderRadius: '1px' }}>
                    <div style={{ height: '100%', width: `${(s.count / (summary.topSections[0]?.count || 1)) * 100}%`, background: 'var(--faded-gold)', borderRadius: '1px', transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Top CTAs */}
        <div>
          <p className="font-mono-body mb-4" style={{ fontSize: '0.58rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(200,169,110,0.55)' }}>
            CTA Clicks
          </p>
          {summary.topCtas.length === 0 ? (
            <p className="font-mono-body" style={{ fontSize: '0.68rem', color: 'rgba(240,234,214,0.3)', fontStyle: 'italic' }}>No data yet</p>
          ) : (
            summary.topCtas.map((c) => (
              <div key={c.label} className="flex items-center justify-between mb-3">
                <div className="flex-1 mr-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono-body" style={{ fontSize: '0.65rem', color: 'var(--parchment)', letterSpacing: '0.05em' }}>{c.label}</span>
                    <span className="font-mono-body" style={{ fontSize: '0.62rem', color: 'var(--faded-gold)' }}>{c.count}</span>
                  </div>
                  <div style={{ height: '2px', background: 'rgba(200,169,110,0.12)', borderRadius: '1px' }}>
                    <div style={{ height: '100%', width: `${(c.count / (summary.topCtas[0]?.count || 1)) * 100}%`, background: 'rgba(200,80,80,0.7)', borderRadius: '1px', transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent events */}
      <div className="mb-10">
        <p className="font-mono-body mb-4" style={{ fontSize: '0.58rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(200,169,110,0.55)' }}>
          Recent Events
        </p>
        {summary.recentEvents.length === 0 ? (
          <p className="font-mono-body" style={{ fontSize: '0.68rem', color: 'rgba(240,234,214,0.3)', fontStyle: 'italic' }}>
            No events recorded yet. Visit the site to start tracking.
          </p>
        ) : (
          <div style={{ border: '1px solid var(--rule-color)' }}>
            {summary.recentEvents.slice(0, 10).map((ev, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-2"
                style={{ borderBottom: i < 9 ? '1px solid rgba(200,169,110,0.08)' : 'none' }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="font-mono-body"
                    style={{
                      fontSize: '0.52rem',
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      padding: '0.15rem 0.5rem',
                      backgroundColor:
                        ev.type === 'pageview' ? 'rgba(200,169,110,0.15)' :
                        ev.type === 'cta_click' ? 'rgba(200,80,80,0.15)' :
                        'rgba(240,234,214,0.08)',
                      color:
                        ev.type === 'pageview' ? 'var(--faded-gold)' :
                        ev.type === 'cta_click' ? 'rgba(220,100,100,0.9)' :
                        'rgba(240,234,214,0.5)',
                    }}
                  >
                    {ev.type === 'pageview' ? 'view' : ev.type === 'cta_click' ? 'cta' : 'section'}
                  </span>
                  <span className="font-mono-body" style={{ fontSize: '0.68rem', color: 'var(--parchment)', letterSpacing: '0.04em' }}>{ev.label}</span>
                </div>
                <span className="font-mono-body" style={{ fontSize: '0.58rem', color: 'rgba(240,234,214,0.3)', letterSpacing: '0.05em' }}>
                  {formatTime(ev.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="pt-6 flex items-center gap-4" style={{ borderTop: '1px solid var(--rule-color)' }}>
        <button
          onClick={load}
          className="font-mono-body"
          style={{ fontSize: '0.62rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--ink-black)', backgroundColor: 'var(--faded-gold)', padding: '0.7rem 1.8rem', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--parchment)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--faded-gold)'; }}
        >
          Refresh
        </button>
        <button
          onClick={handleClear}
          className="font-mono-body"
          style={{ fontSize: '0.62rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(200,80,80,0.7)', backgroundColor: 'transparent', padding: '0.7rem 1.8rem', border: '1px solid rgba(200,80,80,0.3)', cursor: 'pointer', transition: 'all 0.2s ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(220,100,100,1)'; e.currentTarget.style.borderColor = 'rgba(220,100,100,0.6)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(200,80,80,0.7)'; e.currentTarget.style.borderColor = 'rgba(200,80,80,0.3)'; }}
        >
          Clear Data
        </button>
        {cleared && (
          <span className="font-mono-body" style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: 'rgba(200,169,110,0.7)', textTransform: 'uppercase' }}>
            ✓ Data cleared
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Main Admin Panel ── */
export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>('content');
  const [content, setContent] = useState<ContentData>(defaultContent);
  const [contentSaveState, setContentSaveState] = useState<SaveState>('idle');
  const [gallerySaveState, setGallerySaveState] = useState<SaveState>('idle');
  const [contactSaveState, setContactSaveState] = useState<SaveState>('idle');

  useEffect(() => {
    const isAuth = sessionStorage.getItem(SESSION_KEY) === 'true';
    setAuthenticated(isAuth);
  }, []);

  const handleLogin = () => setAuthenticated(true);

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthenticated(false);
  };

  const handleSave = async (
    setter: React.Dispatch<React.SetStateAction<SaveState>>,
    shouldFail = false
  ) => {
    setter('loading');
    await new Promise((r) => setTimeout(r, 900));
    if (shouldFail) {
      setter('error');
      setTimeout(() => setter('idle'), 3000);
    } else {
      setter('success');
      setTimeout(() => setter('idle'), 2500);
    }
  };

  const update = (key: keyof ContentData, value: string) => {
    setContent((prev) => ({ ...prev, [key]: value }));
  };

  if (authenticated === null) {
    return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--ink-black)' }} />;
  }

  if (!authenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'content', label: '01 — Content' },
    { key: 'gallery', label: '02 — Gallery' },
    { key: 'contact', label: '03 — Contact' },
    { key: 'analytics', label: '04 — Analytics' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--ink-black)', color: 'var(--parchment)' }}>
      {/* Admin Header */}
      <header className="flex items-center justify-between px-6 md:px-10 py-5" style={{ borderBottom: '1px solid var(--rule-color)' }}>
        <div className="flex items-center gap-4">
          <span className="font-serif-display" style={{ fontSize: '1.1rem', fontWeight: 900, fontStyle: 'italic', color: 'var(--faded-gold)', letterSpacing: '0.1em' }}>
            SERBERO INK
          </span>
          <span className="font-mono-body" style={{ fontSize: '0.58rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(200,169,110,0.45)' }}>
            / Admin Panel
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/homepage" className="font-mono-body" style={{ fontSize: '0.6rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(240,234,214,0.45)', textDecoration: 'none', transition: 'color 0.2s ease' }}>
            ← Back to Site
          </Link>
          <button
            onClick={handleLogout}
            className="font-mono-body"
            style={{ fontSize: '0.6rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(200,80,80,0.7)', background: 'none', border: '1px solid rgba(200,80,80,0.3)', padding: '0.4rem 1rem', cursor: 'pointer', transition: 'all 0.2s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(220,100,100,1)'; e.currentTarget.style.borderColor = 'rgba(220,100,100,0.6)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(200,80,80,0.7)'; e.currentTarget.style.borderColor = 'rgba(200,80,80,0.3)'; }}
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row min-h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <aside className="md:w-52 flex-shrink-0 py-8 px-4 md:px-6" style={{ borderRight: '1px solid var(--rule-color)' }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="font-mono-body w-full text-left py-3 px-3 mb-1"
              style={{
                fontSize: '0.62rem',
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: tab === t.key ? 'var(--faded-gold)' : 'rgba(240,234,214,0.4)',
                background: tab === t.key ? 'rgba(200,169,110,0.07)' : 'none',
                border: 'none',
                cursor: 'pointer',
                borderLeft: tab === t.key ? '1px solid var(--faded-gold)' : '1px solid transparent',
                transition: 'all 0.2s ease',
              }}
            >
              {t.label}
            </button>
          ))}
        </aside>

        {/* Main content */}
        <main className="flex-1 py-8 px-6 md:px-10 max-w-3xl">

          {/* ── CONTENT TAB ── */}
          {tab === 'content' && (
            <div>
              <SectionLabel>Page Content</SectionLabel>
              <FieldGroup label="Hero Label">
                <AdminInput value={content.heroLabel} onChange={(v) => update('heroLabel', v)} />
              </FieldGroup>
              <FieldGroup label="Hero Tagline">
                <AdminInput value={content.heroTagline} onChange={(v) => update('heroTagline', v)} />
              </FieldGroup>
              <FieldGroup label="About Heading">
                <AdminInput value={content.aboutHeading} onChange={(v) => update('aboutHeading', v)} />
              </FieldGroup>
              <FieldGroup label="About Bio (paragraph 1)">
                <AdminTextarea value={content.aboutBio1} onChange={(v) => update('aboutBio1', v)} rows={4} />
              </FieldGroup>
              <FieldGroup label="About Bio (paragraph 2)">
                <AdminTextarea value={content.aboutBio2} onChange={(v) => update('aboutBio2', v)} rows={3} />
              </FieldGroup>
              <FieldGroup label="Pull Quote">
                <AdminInput value={content.aboutQuote} onChange={(v) => update('aboutQuote', v)} />
              </FieldGroup>
              <FieldGroup label="Studio Location">
                <AdminInput value={content.aboutLocation} onChange={(v) => update('aboutLocation', v)} />
              </FieldGroup>
              <SaveButton saveState={contentSaveState} onSave={() => handleSave(setContentSaveState)} />
            </div>
          )}

          {/* ── GALLERY TAB ── */}
          {tab === 'gallery' && (
            <div>
              <SectionLabel>Gallery Images</SectionLabel>
              <p className="font-mono-body mb-8" style={{ fontSize: '0.72rem', lineHeight: 1.8, color: 'rgba(240,234,214,0.5)' }}>
                Upload images for each gallery slot. Recommended: high-res JPG/PNG, portrait or landscape depending on slot.
              </p>
              <div className="grid grid-cols-1 gap-4">
                {galleryPlaceholders.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4" style={{ border: '1px solid var(--rule-color)' }}>
                    <div style={{ width: '64px', height: '64px', flexShrink: 0, background: 'linear-gradient(135deg, #1a0f0a 0%, #2d1a10 100%)', border: '1px solid rgba(200,169,110,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '0.55rem', color: 'rgba(200,169,110,0.4)', letterSpacing: '0.1em' }}>{item.id}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono-body mb-2" style={{ fontSize: '0.62rem', letterSpacing: '0.2em', color: 'var(--faded-gold)', textTransform: 'uppercase' }}>Slot {item.id}</p>
                      <p className="font-mono-body mb-3" style={{ fontSize: '0.68rem', color: 'rgba(240,234,214,0.5)' }}>{item.label}</p>
                      <label className="font-mono-body" style={{ fontSize: '0.6rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--ink-black)', backgroundColor: 'var(--parchment)', padding: '0.4rem 1rem', cursor: 'pointer', display: 'inline-block' }}>
                        Upload Image
                        <input type="file" accept="image/*" className="sr-only" onChange={() => {}} />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              <SaveButton saveState={gallerySaveState} onSave={() => handleSave(setGallerySaveState)} />
            </div>
          )}

          {/* ── CONTACT TAB ── */}
          {tab === 'contact' && (
            <div>
              <SectionLabel>Contact & Booking</SectionLabel>
              <FieldGroup label="Email Address">
                <AdminInput value={content.bookingEmail} onChange={(v) => update('bookingEmail', v)} type="email" />
              </FieldGroup>
              <FieldGroup label="Instagram Handle">
                <AdminInput value={content.bookingInstagram} onChange={(v) => update('bookingInstagram', v)} />
              </FieldGroup>
              <FieldGroup label="Location Text">
                <AdminInput value={content.bookingLocation} onChange={(v) => update('bookingLocation', v)} />
              </FieldGroup>
              <FieldGroup label="WhatsApp Number (digits only, with country code)">
                <AdminInput value={content.whatsappNumber} onChange={(v) => update('whatsappNumber', v)} placeholder="e.g. 34612345678" />
              </FieldGroup>
              <SaveButton saveState={contactSaveState} onSave={() => handleSave(setContactSaveState)} />
            </div>
          )}

          {/* ── ANALYTICS TAB ── */}
          {tab === 'analytics' && <AnalyticsDashboard />}
        </main>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

/* ── Sub-components ── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono-body mb-8" style={{ fontSize: '0.6rem', letterSpacing: '0.45em', textTransform: 'uppercase', color: 'var(--faded-gold)', opacity: 0.7, borderBottom: '1px solid var(--rule-color)', paddingBottom: '1rem' }}>
      {children}
    </p>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <label className="font-mono-body block mb-2" style={{ fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(200,169,110,0.65)' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function AdminInput({ value, onChange, type = 'text', placeholder }: { value: string; onChange: (v: string) => void; type?: string; placeholder?: string; }) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="font-mono-body w-full px-4 py-3"
      style={{ fontSize: '0.78rem', background: 'rgba(240,234,214,0.04)', border: '1px solid rgba(200,169,110,0.25)', color: 'var(--parchment)', outline: 'none', letterSpacing: '0.04em', transition: 'border-color 0.2s ease' }}
      onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(200,169,110,0.6)'; }}
      onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(200,169,110,0.25)'; }}
    />
  );
}

function AdminTextarea({ value, onChange, rows = 3 }: { value: string; onChange: (v: string) => void; rows?: number; }) {
  return (
    <textarea
      value={value}
      rows={rows}
      onChange={(e) => onChange(e.target.value)}
      className="font-mono-body w-full px-4 py-3 resize-y"
      style={{ fontSize: '0.78rem', background: 'rgba(240,234,214,0.04)', border: '1px solid rgba(200,169,110,0.25)', color: 'var(--parchment)', outline: 'none', letterSpacing: '0.04em', lineHeight: 1.8, transition: 'border-color 0.2s ease' }}
      onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(200,169,110,0.6)'; }}
      onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(200,169,110,0.25)'; }}
    />
  );
}

function SaveButton({ onSave, saveState }: { onSave: () => void; saveState: SaveState }) {
  const isLoading = saveState === 'loading';
  const isSuccess = saveState === 'success';
  const isError = saveState === 'error';

  return (
    <div className="mt-10 pt-6" style={{ borderTop: '1px solid var(--rule-color)' }}>
      <div className="flex items-center gap-4">
        <button
          onClick={onSave}
          disabled={isLoading}
          className="font-mono-body flex items-center gap-2"
          style={{
            fontSize: '0.65rem',
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'var(--ink-black)',
            backgroundColor: isError ? 'rgba(180,60,60,0.85)' : 'var(--faded-gold)',
            padding: '0.85rem 2.5rem',
            border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s ease',
            opacity: isLoading ? 0.8 : 1,
          }}
          onMouseEnter={(e) => { if (!isLoading && !isError) e.currentTarget.style.backgroundColor = 'var(--parchment)'; }}
          onMouseLeave={(e) => { if (!isLoading && !isError) e.currentTarget.style.backgroundColor = 'var(--faded-gold)'; }}
        >
          {isLoading && (
            <span style={{ display: 'inline-block', width: '10px', height: '10px', border: '1.5px solid var(--ink-black)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          )}
          {isLoading ? 'Saving…' : isError ? '✗ Error — Retry' : 'Save Changes'}
        </button>

        {isSuccess && (
          <span
            className="font-mono-body"
            style={{ fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(120,200,120,0.85)' }}
          >
            ✓ Saved successfully
          </span>
        )}
        {isError && (
          <span
            className="font-mono-body"
            style={{ fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(200,80,80,0.85)' }}
          >
            Something went wrong
          </span>
        )}
      </div>
    </div>
  );
}
