'use client';

import Link from 'next/link';
import { useLang } from './LanguageContext';

export default function SiteNav() {
  const { lang, t, setLanguage } = useLang();

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4"
      style={{
        background: 'linear-gradient(to bottom, rgba(10,10,10,0.92) 0%, transparent 100%)',
        backdropFilter: 'blur(2px)',
      }}
      aria-label="Site navigation"
    >
      {/* Logo mark */}
      <span
        className="font-serif-display"
        style={{
          fontSize: '0.85rem',
          fontWeight: 900,
          fontStyle: 'italic',
          letterSpacing: '0.12em',
          color: 'var(--faded-gold)',
          textTransform: 'uppercase',
        }}
      >
        S·INK
      </span>

      {/* Right controls */}
      <div className="flex items-center gap-3 md:gap-5">
        <button
          type="button"
          onClick={() => setLanguage('es')}
          aria-label="Cambiar a espanol"
          className="font-mono-body"
          style={{
            fontSize: '0.6rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: lang === 'es' ? 'var(--parchment)' : 'var(--faded-gold)',
            background: 'none',
            border:
              lang === 'es' ? '1px solid var(--faded-gold)' : '1px solid rgba(200,169,110,0.35)',
            padding: '0.35rem 0.7rem',
            cursor: 'pointer',
            transition: 'border-color 0.3s ease, color 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--faded-gold)';
            e.currentTarget.style.color = 'var(--parchment)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(200,169,110,0.35)';
            e.currentTarget.style.color = 'var(--faded-gold)';
          }}
        >
          ES
        </button>

        <button
          type="button"
          onClick={() => setLanguage('en')}
          aria-label="Switch to English"
          className="font-mono-body"
          style={{
            fontSize: '0.6rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: lang === 'en' ? 'var(--parchment)' : 'var(--faded-gold)',
            background: 'none',
            border:
              lang === 'en' ? '1px solid var(--faded-gold)' : '1px solid rgba(200,169,110,0.35)',
            padding: '0.35rem 0.7rem',
            cursor: 'pointer',
            transition: 'border-color 0.3s ease, color 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--faded-gold)';
            e.currentTarget.style.color = 'var(--parchment)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor =
              lang === 'en' ? 'var(--faded-gold)' : 'rgba(200,169,110,0.35)';
            e.currentTarget.style.color = lang === 'en' ? 'var(--parchment)' : 'var(--faded-gold)';
          }}
        >
          EN
        </button>

        {/* Admin link */}
        <Link
          href="/admin"
          className="font-mono-body"
          style={{
            fontSize: '0.6rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'rgba(200,169,110,0.55)',
            textDecoration: 'none',
            transition: 'color 0.3s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.color = 'var(--faded-gold)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(200,169,110,0.55)';
          }}
        >
          {t.adminPanel}
        </Link>
      </div>
    </nav>
  );
}
