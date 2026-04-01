'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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

type Tab = 'content' | 'gallery' | 'contact';

/* ── Login Screen ── */
function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      {/* Grain overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
          opacity: 0.35,
          zIndex: 0,
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-12">
          <p
            className="font-serif-display"
            style={{
              fontSize: '2rem',
              fontWeight: 900,
              fontStyle: 'italic',
              color: 'var(--faded-gold)',
              letterSpacing: '0.12em',
              marginBottom: '0.4rem',
            }}
          >
            SERBERO INK
          </p>
          <p
            className="font-mono-body"
            style={{
              fontSize: '0.55rem',
              letterSpacing: '0.45em',
              textTransform: 'uppercase',
              color: 'rgba(200,169,110,0.45)',
            }}
          >
            Admin Access
          </p>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid var(--rule-color)', marginBottom: '2.5rem' }} />

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ animation: shake ? 'shake 0.4s ease' : 'none' }}>
          <div className="mb-6">
            <label
              className="font-mono-body block mb-2"
              style={{
                fontSize: '0.58rem',
                letterSpacing: '0.35em',
                textTransform: 'uppercase',
                color: 'rgba(200,169,110,0.65)',
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="font-mono-body w-full px-4 py-3"
              style={{
                fontSize: '0.85rem',
                background: 'rgba(240,234,214,0.04)',
                border: `1px solid ${error ? 'rgba(180,60,60,0.7)' : 'rgba(200,169,110,0.25)'}`,
                color: 'var(--parchment)',
                outline: 'none',
                letterSpacing: '0.15em',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => { if (!error) e.currentTarget.style.borderColor = 'rgba(200,169,110,0.6)'; }}
              onBlur={(e) => { if (!error) e.currentTarget.style.borderColor = 'rgba(200,169,110,0.25)'; }}
              placeholder="Enter password"
            />
            {error && (
              <p
                className="font-mono-body mt-2"
                style={{
                  fontSize: '0.6rem',
                  letterSpacing: '0.2em',
                  color: 'rgba(200,80,80,0.85)',
                  textTransform: 'uppercase',
                }}
              >
                ✗ Incorrect password
              </p>
            )}
          </div>

          <button
            type="submit"
            className="font-mono-body w-full py-3"
            style={{
              fontSize: '0.65rem',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              color: 'var(--ink-black)',
              backgroundColor: 'var(--faded-gold)',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--parchment)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--faded-gold)'; }}
          >
            Enter Panel
          </button>
        </form>

        {/* Back link */}
        <div className="text-center mt-8">
          <Link
            href="/homepage"
            className="font-mono-body"
            style={{
              fontSize: '0.58rem',
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: 'rgba(240,234,214,0.3)',
              textDecoration: 'none',
              transition: 'color 0.2s ease',
            }}
          >
            ← Back to Site
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}

/* ── Main Admin Panel ── */
export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>('content');
  const [content, setContent] = useState<ContentData>(defaultContent);
  const [saved, setSaved] = useState(false);

  // Check session on mount
  useEffect(() => {
    const isAuth = sessionStorage.getItem(SESSION_KEY) === 'true';
    setAuthenticated(isAuth);
  }, []);

  const handleLogin = () => setAuthenticated(true);

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthenticated(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const update = (key: keyof ContentData, value: string) => {
    setContent((prev) => ({ ...prev, [key]: value }));
  };

  // Loading state while checking session
  if (authenticated === null) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--ink-black)' }}
      />
    );
  }

  // Show login if not authenticated
  if (!authenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--ink-black)', color: 'var(--parchment)' }}
    >
      {/* Admin Header */}
      <header
        className="flex items-center justify-between px-6 md:px-10 py-5"
        style={{ borderBottom: '1px solid var(--rule-color)' }}
      >
        <div className="flex items-center gap-4">
          <span
            className="font-serif-display"
            style={{
              fontSize: '1.1rem',
              fontWeight: 900,
              fontStyle: 'italic',
              color: 'var(--faded-gold)',
              letterSpacing: '0.1em',
            }}
          >
            SERBERO INK
          </span>
          <span
            className="font-mono-body"
            style={{
              fontSize: '0.58rem',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              color: 'rgba(200,169,110,0.45)',
            }}
          >
            / Admin Panel
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/homepage"
            className="font-mono-body"
            style={{
              fontSize: '0.6rem',
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: 'rgba(240,234,214,0.45)',
              textDecoration: 'none',
              transition: 'color 0.2s ease',
            }}
          >
            ← Back to Site
          </Link>
          <button
            onClick={handleLogout}
            className="font-mono-body"
            style={{
              fontSize: '0.6rem',
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: 'rgba(200,80,80,0.7)',
              background: 'none',
              border: '1px solid rgba(200,80,80,0.3)',
              padding: '0.4rem 1rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'rgba(220,100,100,1)';
              e.currentTarget.style.borderColor = 'rgba(220,100,100,0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(200,80,80,0.7)';
              e.currentTarget.style.borderColor = 'rgba(200,80,80,0.3)';
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row min-h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <aside
          className="md:w-52 flex-shrink-0 py-8 px-4 md:px-6"
          style={{ borderRight: '1px solid var(--rule-color)' }}
        >
          {(['content', 'gallery', 'contact'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="font-mono-body w-full text-left py-3 px-3 mb-1"
              style={{
                fontSize: '0.62rem',
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: tab === t ? 'var(--faded-gold)' : 'rgba(240,234,214,0.4)',
                background: tab === t ? 'rgba(200,169,110,0.07)' : 'none',
                border: 'none',
                cursor: 'pointer',
                borderLeft: tab === t ? '1px solid var(--faded-gold)' : '1px solid transparent',
                transition: 'all 0.2s ease',
              }}
            >
              {t === 'content' ? '01 — Content' : t === 'gallery' ? '02 — Gallery' : '03 — Contact'}
            </button>
          ))}
        </aside>

        {/* Main content */}
        <main className="flex-1 py-8 px-6 md:px-10 max-w-3xl">
          {/* Save feedback */}
          {saved && (
            <div
              className="font-mono-body mb-6 px-4 py-3"
              style={{
                fontSize: '0.62rem',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: 'var(--ink-black)',
                backgroundColor: 'var(--faded-gold)',
              }}
            >
              ✓ Changes saved successfully
            </div>
          )}

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
              <SaveButton onSave={handleSave} />
            </div>
          )}

          {/* ── GALLERY TAB ── */}
          {tab === 'gallery' && (
            <div>
              <SectionLabel>Gallery Images</SectionLabel>
              <p
                className="font-mono-body mb-8"
                style={{ fontSize: '0.72rem', lineHeight: 1.8, color: 'rgba(240,234,214,0.5)' }}
              >
                Upload images for each gallery slot. Recommended: high-res JPG/PNG, portrait or landscape depending on slot.
              </p>
              <div className="grid grid-cols-1 gap-4">
                {galleryPlaceholders.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4"
                    style={{ border: '1px solid var(--rule-color)' }}
                  >
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        flexShrink: 0,
                        background: 'linear-gradient(135deg, #1a0f0a 0%, #2d1a10 100%)',
                        border: '1px solid rgba(200,169,110,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span style={{ fontSize: '0.55rem', color: 'rgba(200,169,110,0.4)', letterSpacing: '0.1em' }}>
                        {item.id}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-mono-body mb-2"
                        style={{ fontSize: '0.62rem', letterSpacing: '0.2em', color: 'var(--faded-gold)', textTransform: 'uppercase' }}
                      >
                        Slot {item.id}
                      </p>
                      <p
                        className="font-mono-body mb-3"
                        style={{ fontSize: '0.68rem', color: 'rgba(240,234,214,0.5)' }}
                      >
                        {item.label}
                      </p>
                      <label
                        className="font-mono-body"
                        style={{
                          fontSize: '0.6rem',
                          letterSpacing: '0.22em',
                          textTransform: 'uppercase',
                          color: 'var(--ink-black)',
                          backgroundColor: 'var(--parchment)',
                          padding: '0.4rem 1rem',
                          cursor: 'pointer',
                          display: 'inline-block',
                        }}
                      >
                        Upload Image
                        <input type="file" accept="image/*" className="sr-only" onChange={() => {}} />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              <SaveButton onSave={handleSave} />
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
              <SaveButton onSave={handleSave} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-mono-body mb-8"
      style={{
        fontSize: '0.6rem',
        letterSpacing: '0.45em',
        textTransform: 'uppercase',
        color: 'var(--faded-gold)',
        opacity: 0.7,
        borderBottom: '1px solid var(--rule-color)',
        paddingBottom: '1rem',
      }}
    >
      {children}
    </p>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <label
        className="font-mono-body block mb-2"
        style={{
          fontSize: '0.6rem',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: 'rgba(200,169,110,0.65)',
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function AdminInput({
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="font-mono-body w-full px-4 py-3"
      style={{
        fontSize: '0.78rem',
        background: 'rgba(240,234,214,0.04)',
        border: '1px solid rgba(200,169,110,0.25)',
        color: 'var(--parchment)',
        outline: 'none',
        letterSpacing: '0.04em',
        transition: 'border-color 0.2s ease',
      }}
      onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(200,169,110,0.6)'; }}
      onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(200,169,110,0.25)'; }}
    />
  );
}

function AdminTextarea({
  value,
  onChange,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      rows={rows}
      onChange={(e) => onChange(e.target.value)}
      className="font-mono-body w-full px-4 py-3 resize-y"
      style={{
        fontSize: '0.78rem',
        background: 'rgba(240,234,214,0.04)',
        border: '1px solid rgba(200,169,110,0.25)',
        color: 'var(--parchment)',
        outline: 'none',
        letterSpacing: '0.04em',
        lineHeight: 1.8,
        transition: 'border-color 0.2s ease',
      }}
      onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(200,169,110,0.6)'; }}
      onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(200,169,110,0.25)'; }}
    />
  );
}

function SaveButton({ onSave }: { onSave: () => void }) {
  return (
    <div className="mt-10 pt-6" style={{ borderTop: '1px solid var(--rule-color)' }}>
      <button
        onClick={onSave}
        className="font-mono-body"
        style={{
          fontSize: '0.65rem',
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: 'var(--ink-black)',
          backgroundColor: 'var(--faded-gold)',
          padding: '0.85rem 2.5rem',
          border: 'none',
          cursor: 'pointer',
          transition: 'background-color 0.2s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--parchment)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--faded-gold)'; }}
      >
        Save Changes
      </button>
    </div>
  );
}
