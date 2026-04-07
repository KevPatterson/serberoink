'use client';

import { useLang } from './LanguageContext';

interface SiteFooterProps {
  footer: {
    brand: string;
    established: string;
    rights: string;
    tagline: string;
  };
  contact: {
    instagram: string;
    instagramUrl: string;
    whatsapp: string;
    whatsappText: string;
  };
}

export default function SiteFooter({ footer, contact }: SiteFooterProps) {
  const { lang } = useLang();

  const copy =
    lang === 'en'
      ? {
          devLabel: 'Development',
          devText: 'Developed by Clavisoft',
          githubCta: 'View GitHub',
          whatsappCta: 'Contact to build your own catalog',
          whatsappMessage:
            'Hi Kevin, I want to create my own tattoo catalog website. Could we discuss it?',
          contactLabel: 'Contact',
          instagramLabel: 'Instagram',
          whatsappLabel: 'WhatsApp',
        }
      : {
          devLabel: 'Desarrollo',
          devText: 'Desarrollado por Clavisoft.',
          githubCta: 'Ver GitHub',
          whatsappCta: 'Contactar para crear tu propio catalogo',
          whatsappMessage:
            'Hola Kevin, quiero crear mi propio sitio de catalogo para tatuajes. Podemos hablarlo?',
          contactLabel: 'Contacto',
          instagramLabel: 'Instagram',
          whatsappLabel: 'WhatsApp',
        };

  const githubUrl = 'https://github.com/KevPatterson';
  const whatsappUrl = `https://wa.me/5356954200?text=${encodeURIComponent(copy.whatsappMessage)}`;
  const bookingWhatsappUrl = `https://wa.me/${contact.whatsapp.replace(/\D+/g, '')}?text=${encodeURIComponent(contact.whatsappText)}`;

  return (
    <footer
      className="py-10 px-8 md:px-16 text-center"
      style={{ borderTop: '1px solid var(--rule-color)' }}
    >
      <div className="mx-auto mb-7" style={{ maxWidth: '760px', textAlign: 'left' }}>
        <p
          className="font-mono-body"
          style={{
            margin: '0 0 0.7rem',
            fontSize: '0.58rem',
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: 'var(--faded-gold)',
            opacity: 0.6,
          }}
        >
          {copy.devLabel}
        </p>
        <p
          className="font-serif-display"
          style={{
            margin: '0 0 0.95rem',
            fontSize: '1.02rem',
            lineHeight: 1.45,
            color: 'var(--parchment)',
            opacity: 0.88,
          }}
        >
          {copy.devText}
        </p>
        <div
          className="font-mono-body"
          style={{
            display: 'grid',
            gap: '0.55rem',
            fontSize: '0.62rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--parchment)',
              textDecoration: 'none',
              opacity: 0.86,
              borderBottom: '1px solid rgba(200,169,110,0.28)',
              width: 'fit-content',
              paddingBottom: '0.2rem',
            }}
          >
            {copy.githubCta}
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--parchment)',
              textDecoration: 'none',
              opacity: 0.86,
              borderBottom: '1px solid rgba(200,169,110,0.28)',
              width: 'fit-content',
              paddingBottom: '0.2rem',
            }}
          >
            {copy.whatsappCta}
          </a>
        </div>
      </div>

      <div className="mx-auto mb-8" style={{ maxWidth: '760px', textAlign: 'left' }}>
        <p
          className="font-mono-body"
          style={{
            margin: '0 0 0.7rem',
            fontSize: '0.58rem',
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: 'var(--faded-gold)',
            opacity: 0.6,
          }}
        >
          {copy.contactLabel}
        </p>
        <div
          className="font-mono-body"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.9rem 1.2rem',
            alignItems: 'center',
            fontSize: '0.6rem',
            letterSpacing: '0.17em',
            textTransform: 'uppercase',
          }}
        >
          <a
            href={contact.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.42rem',
              color: 'var(--parchment)',
              textDecoration: 'none',
              opacity: 0.82,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" stroke="currentColor" strokeWidth="1.7" />
              <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.7" />
              <circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" />
            </svg>
            <span>{copy.instagramLabel}</span>
          </a>

          <a
            href={bookingWhatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.42rem',
              color: 'var(--parchment)',
              textDecoration: 'none',
              opacity: 0.82,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M20 11.8c0 4.4-3.6 8-8 8-1.2 0-2.4-.3-3.5-.8L4 20l1.1-4.2c-.6-1.2-1-2.6-1-4 0-4.4 3.6-8 8-8s7.9 3.6 7.9 8Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9.2 8.8c.2-.4.5-.4.7-.4h.6c.2 0 .4.1.5.4l.7 1.7c.1.3.1.5-.1.7l-.5.6c.3.7 1 1.3 1.7 1.7l.6-.5c.2-.2.5-.2.7-.1l1.7.7c.3.1.4.3.4.5v.6c0 .3 0 .5-.4.7-.4.2-1 .4-1.6.3-2.8-.6-5.1-2.9-5.7-5.7-.1-.6.1-1.2.3-1.6Z" fill="currentColor" />
            </svg>
            <span>{copy.whatsappLabel}</span>
          </a>
        </div>
      </div>

      <p
        className="font-mono-body"
        style={{
          fontSize: '0.6rem',
          letterSpacing: '0.38em',
          textTransform: 'uppercase',
          color: 'var(--muted-parchment)',
          opacity: 0.55,
          lineHeight: 2.2,
        }}
      >
        {footer.brand} - {footer.established} - {footer.rights}
      </p>
      <p
        className="font-mono-body mt-2"
        style={{
          fontSize: '0.58rem',
          letterSpacing: '0.22em',
          fontStyle: 'italic',
          color: 'var(--faded-gold)',
          opacity: 0.4,
        }}
      >
        {footer.tagline}
      </p>
    </footer>
  );
}