'use client';

import { useLang } from './LanguageContext';

const WHATSAPP_NUMBER = '1234567890'; // Replace with actual WhatsApp number

export default function BookingSection() {
  const { t } = useLang();
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi! I\'d like to book a tattoo session with Serbero Ink.')}`;
  const headingLines = t?.bookingHeading?.split('\n');

  return (
    <section
      className="reveal-section py-20 md:py-36 px-6 md:px-16 lg:px-24"
      id="booking"
      aria-labelledby="booking-heading"
    >
      <div className="max-w-2xl mx-auto text-center">

        {/* Section label */}
        <p
          className="font-mono-body mb-10"
          style={{
            fontSize: '0.62rem',
            letterSpacing: '0.5em',
            color: 'var(--faded-gold)',
            textTransform: 'uppercase',
            opacity: 0.7,
          }}
        >
          {t?.bookingLabel}
        </p>

        <h2
          id="booking-heading"
          className="font-serif-display mb-10"
          style={{
            fontSize: 'clamp(2rem, 6vw, 5rem)',
            fontWeight: 900,
            fontStyle: 'italic',
            lineHeight: 1.0,
            color: 'var(--parchment)',
            letterSpacing: '-0.02em',
          }}
        >
          {headingLines?.[0]}<br />{headingLines?.[1]}
        </h2>

        {/* Thin rule */}
        <div
          className="mx-auto mb-10"
          style={{
            width: '60px',
            height: '1px',
            backgroundColor: 'var(--rule-color)',
          }}
          aria-hidden="true"
        />

        {/* Contact info */}
        <div
          className="font-mono-body mb-12 space-y-2"
          style={{
            fontSize: '0.78rem',
            lineHeight: 2.2,
            color: 'var(--muted-parchment)',
            letterSpacing: '0.08em',
          }}
        >
          <p>
            <span style={{ color: 'var(--faded-gold)', opacity: 0.6, letterSpacing: '0.3em', fontSize: '0.6rem', textTransform: 'uppercase' }}>
              {t?.bookingEmail}{' '}
            </span>
            <a
              href="mailto:studio@serberoink.com"
              style={{ color: 'var(--parchment)', textDecoration: 'none', borderBottom: '1px solid var(--rule-color)' }}
            >
              studio@serberoink.com
            </a>
          </p>
          <p>
            <span style={{ color: 'var(--faded-gold)', opacity: 0.6, letterSpacing: '0.3em', fontSize: '0.6rem', textTransform: 'uppercase' }}>
              {t?.bookingInstagram}{' '}
            </span>
            <a
              href="https://instagram.com/serbero_ink"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--parchment)', textDecoration: 'none', borderBottom: '1px solid var(--rule-color)' }}
            >
              @serbero_ink
            </a>
          </p>
          <p>
            <span style={{ color: 'var(--faded-gold)', opacity: 0.6, letterSpacing: '0.3em', fontSize: '0.6rem', textTransform: 'uppercase' }}>
              {t?.bookingLocation}{' '}
            </span>
            <span>{t?.bookingLocationVal}</span>
          </p>
        </div>

        {/* CTA Button — WhatsApp redirect */}
        <div className="flex justify-center mb-8">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-btn"
            aria-label="Book a session via WhatsApp"
          >
            {t?.bookingCTA}
          </a>
        </div>

        {/* Sub-note */}
        <p
          className="font-mono-body"
          style={{
            fontSize: '0.65rem',
            letterSpacing: '0.18em',
            fontStyle: 'italic',
            color: 'var(--muted-parchment)',
            opacity: 0.6,
          }}
        >
          {t?.bookingNote}
        </p>

        {/* Decorative bottom mark */}
        <div
          className="mt-16 flex items-center justify-center gap-6"
          aria-hidden="true"
        >
          <div style={{ width: '40px', height: '1px', backgroundColor: 'var(--rule-color)' }} />
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M7 1 L7 13 M1 7 L13 7" stroke="var(--faded-gold)" strokeWidth="0.8" strokeOpacity="0.4" />
          </svg>
          <div style={{ width: '40px', height: '1px', backgroundColor: 'var(--rule-color)' }} />
        </div>
      </div>
    </section>
  );
}