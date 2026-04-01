'use client';

import Link from 'next/link';

export default function SiteNav() {
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
          Admin
        </Link>
      </div>
    </nav>
  );
}
