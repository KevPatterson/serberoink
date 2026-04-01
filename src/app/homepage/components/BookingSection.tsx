'use client';

import { useRef } from 'react';
import { trackCtaClick } from '@/lib/analytics';

interface BookingSectionProps {
  contact: {
    sectionNumber: string;
    sectionLabel: string;
    heading: string;
    email: string;
    instagram: string;
    instagramUrl: string;
    location: string;
    whatsapp: string;
    whatsappText: string;
    ctaText: string;
    quote: string;
  };
}

function createWhatsappUrl(number: string, message: string): string {
  const clean = number.replace(/\D+/g, '');
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

export default function BookingSection({ contact }: BookingSectionProps) {
  const whatsappUrl = createWhatsappUrl(contact.whatsapp, contact.whatsappText);
  const headingLines = contact.heading.split('\n');
  const btnRef = useRef<HTMLAnchorElement>(null);

  const handleBtnMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * 0.28;
    const dy = (e.clientY - cy) * 0.28;
    btn.style.transform = `translate(${dx}px, ${dy}px)`;
    btn.style.transition = 'transform 0.15s ease';
  };

  const handleBtnMouseLeave = () => {
    const btn = btnRef.current;
    if (!btn) return;
    btn.style.transform = 'translate(0, 0)';
    btn.style.transition =
      'transform 0.5s cubic-bezier(0.16,1,0.3,1), background-color 0.3s ease, color 0.3s ease, letter-spacing 0.3s ease';
  };

  return (
    <section
      className="reveal-section py-20 md:py-36 px-6 md:px-16 lg:px-24"
      id="booking"
      aria-labelledby="booking-heading"
    >
      <div className="max-w-2xl mx-auto text-center">
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
          {contact.sectionNumber} - Contact
        </p>

        <h2
          id="booking-heading"
          className="font-serif-display mb-10"
          style={{
            fontSize: 'clamp(2rem, 6vw, 5rem)',
            fontWeight: 900,
            fontStyle: 'italic',
            lineHeight: 1,
            color: 'var(--parchment)',
            letterSpacing: '-0.02em',
          }}
        >
          {headingLines[0]}
          <br />
          {headingLines[1] || ''}
        </h2>

        <div className="mx-auto mb-10" style={{ width: '60px', height: '1px', backgroundColor: 'var(--rule-color)' }} aria-hidden="true" />

        <div
          className="font-mono-body mb-12 space-y-2"
          style={{ fontSize: '0.78rem', lineHeight: 2.2, color: 'var(--muted-parchment)', letterSpacing: '0.08em' }}
        >
          <p>
            <span style={{ color: 'var(--faded-gold)', opacity: 0.6, letterSpacing: '0.3em', fontSize: '0.6rem', textTransform: 'uppercase' }}>
              Email{' '}
            </span>
            <a href={`mailto:${contact.email}`} style={{ color: 'var(--parchment)', textDecoration: 'none', borderBottom: '1px solid var(--rule-color)' }}>
              {contact.email}
            </a>
          </p>
          <p>
            <span style={{ color: 'var(--faded-gold)', opacity: 0.6, letterSpacing: '0.3em', fontSize: '0.6rem', textTransform: 'uppercase' }}>
              Instagram{' '}
            </span>
            <a href={contact.instagramUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--parchment)', textDecoration: 'none', borderBottom: '1px solid var(--rule-color)' }}>
              {contact.instagram}
            </a>
          </p>
          <p>
            <span style={{ color: 'var(--faded-gold)', opacity: 0.6, letterSpacing: '0.3em', fontSize: '0.6rem', textTransform: 'uppercase' }}>
              Location{' '}
            </span>
            <span>{contact.location}</span>
          </p>
        </div>

        <div className="flex justify-center mb-8" style={{ padding: '16px 0' }}>
          <a
            ref={btnRef}
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-btn"
            aria-label="Book a session via WhatsApp"
            onClick={() => trackCtaClick('WhatsApp Booking')}
            onMouseMove={handleBtnMouseMove}
            onMouseLeave={handleBtnMouseLeave}
          >
            {contact.ctaText}
          </a>
        </div>

        <p
          className="font-mono-body"
          style={{ fontSize: '0.65rem', letterSpacing: '0.18em', fontStyle: 'italic', color: 'var(--muted-parchment)', opacity: 0.6 }}
        >
          {contact.quote}
        </p>
      </div>
    </section>
  );
}
