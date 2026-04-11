'use client';

import Link from 'next/link';
import { useLang } from './LanguageContext';
import { useUIStrings } from '@/hooks/useUIStrings';

interface SiteNavProps {
  whatsappNumber: string;
}

export default function SiteNav({ whatsappNumber }: SiteNavProps) {
  const { lang, setLanguage } = useLang();
  const ui = useUIStrings();
  const contactCta = lang === 'en' ? 'Contact' : 'Contactar';
  const bookingMessage =
    lang === 'en'
      ? 'Hi, I want to schedule a tattoo appointment.'
      : 'Hola, quiero agendar un turno para tatuarme.';
  const whatsappBookingUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(bookingMessage)}`;

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
        <a
          href={whatsappBookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono-body nav-pill transition-all duration-200 ease-out hover:opacity-100 hover:-translate-y-px"
          style={{
            fontSize: '0.68rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--parchment)',
            background: 'rgba(200,169,110,0.12)',
            border: '1px solid rgba(200,169,110,0.45)',
            padding: '0.35rem 0.72rem',
            textDecoration: 'none',
            opacity: 0.9,
          }}
        >
          {contactCta}
        </a>

        <button
          type="button"
          onClick={() => setLanguage('es')}
          aria-label="Cambiar a Espanol"
          className="font-mono-body nav-pill"
          style={{
            fontSize: '0.68rem',
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
        >
          ES
        </button>

        <button
          type="button"
          onClick={() => setLanguage('en')}
          aria-label="Switch to English"
          className="font-mono-body nav-pill"
          style={{
            fontSize: '0.68rem',
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
        >
          EN
        </button>

        {/* Admin link */}
        <Link
          href="/admin/login"
          className="font-mono-body nav-admin-link"
          style={{
            fontSize: '0.68rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'rgba(200,169,110,0.55)',
            textDecoration: 'none',
            transition: 'color 0.3s ease',
          }}
        >
          {ui.adminLink}
        </Link>
      </div>
    </nav>
  );
}
