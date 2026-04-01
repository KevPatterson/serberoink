'use client';

import Link from 'next/link';
import { useLang } from './LanguageContext';

export default function SiteNav() {
  const { lang, t, toggleLang } = useLang();

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
        {/* EN/ES toggle */}
        <button
          onClick={toggleLang}
          aria-label={lang === 'en' ? 'Switch to Spanish' : 'Cambiar a inglés'}
          className="font-mono-body"
          style={{
            fontSize: '0.6rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'var(--faded-gold)',
            background: 'none',
            border: '1px solid rgba(200,169,110,0.35)',
            padding: '0.35rem 0.7rem',
            cursor: 'pointer',
            transition: 'border-color 0.3s ease, color 0.3s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--faded-gold)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--parchment)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(200,169,110,0.35)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--faded-gold)';
          }}
        >
          {lang === 'en' ? 'ES' : 'EN'}
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
