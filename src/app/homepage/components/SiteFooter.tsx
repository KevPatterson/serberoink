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
          devText: 'Built by Kevin Patterson Forján from',
          devCompany: 'Clavisoft',
          githubCta: 'View GitHub',
          devWhatsappCta: 'Build your own website',
          devWhatsappMessage:
            'Hi Kevin, I want to create my own website. Could we discuss it?',
          contactLabel: 'Contact',
          instagramCta: 'Instagram',
          whatsappCta: 'WhatsApp',
        }
      : {
          devLabel: 'Desarrollo',
          devText: 'Hecho por Kevin Patterson Forján de',
          devCompany: 'Clavisoft',
          githubCta: 'Ver GitHub',
          devWhatsappCta: 'Crear tu propio sitio web',
          devWhatsappMessage:
            'Hola Kevin, quiero crear mi propio sitio web. Podemos hablarlo?',
          contactLabel: 'Contacto',
          instagramCta: 'Instagram',
          whatsappCta: 'WhatsApp',
        };

  const githubUrl = 'https://github.com/KevPatterson';
  const devCompanyUrl = 'https://clavisoft.vercel.app';
  const devWhatsappUrl = `https://wa.me/5356954200?text=${encodeURIComponent(copy.devWhatsappMessage)}`;
  const whatsappUrl = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(contact.whatsappText)}`;
  const instagramUrl = contact.instagramUrl;

  return (
    <footer
      className="py-10 px-8 md:px-16 text-center"
      style={{ borderTop: '1px solid var(--rule-color)' }}
    >
      <div className="mx-auto mb-7 grid gap-8 md:grid-cols-2" style={{ maxWidth: '760px', textAlign: 'left' }}>
        <section>
          <p
            className="font-mono-body"
            style={{
              margin: '0 0 0.65rem',
              fontSize: '0.56rem',
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: 'var(--faded-gold)',
              opacity: 0.56,
            }}
          >
            {copy.devLabel}
          </p>
          <div
            className="font-mono-body"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.64rem',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--muted-parchment)',
              opacity: 0.82,
            }}
          >
            <span>
              {copy.devText}{' '}
              <a
                href={devCompanyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all duration-200 ease-out hover:opacity-100"
                style={{
                  color: 'var(--parchment)',
                  textDecoration: 'none',
                  borderBottom: '1px solid rgba(200,169,110,0.32)',
                  opacity: 0.9,
                }}
              >
                {copy.devCompany}
              </a>
            </span>
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-all duration-200 ease-out hover:opacity-100 hover:-translate-y-px"
              style={{
                color: 'var(--parchment)',
                textDecoration: 'none',
                border: '1px solid rgba(200,169,110,0.3)',
                borderRadius: '999px',
                padding: '0.22rem 0.55rem',
                lineHeight: 1,
                opacity: 0.82,
              }}
            >
              {copy.githubCta}
            </a>
            <a
              href={devWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-all duration-200 ease-out hover:opacity-100 hover:-translate-y-px"
              style={{
                color: 'var(--parchment)',
                textDecoration: 'none',
                borderBottom: '1px solid rgba(200,169,110,0.32)',
                paddingBottom: '0.15rem',
                opacity: 0.86,
                lineHeight: 1.15,
              }}
            >
              {copy.devWhatsappCta}
            </a>
          </div>
        </section>

        <section>
          <p
            className="font-mono-body"
            style={{
              margin: '0 0 0.65rem',
              fontSize: '0.56rem',
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: 'var(--faded-gold)',
              opacity: 0.56,
            }}
          >
            {copy.contactLabel}
          </p>
          <div
            className="font-mono-body"
            style={{
              display: 'grid',
              gap: '0.5rem',
              fontSize: '0.64rem',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
            }}
          >
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-all duration-200 ease-out hover:opacity-100 hover:-translate-y-px"
              style={{
                color: 'var(--parchment)',
                textDecoration: 'none',
                opacity: 0.86,
                width: 'fit-content',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
              </svg>
              {copy.instagramCta}
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-all duration-200 ease-out hover:opacity-100 hover:-translate-y-px"
              style={{
                color: 'var(--parchment)',
                textDecoration: 'none',
                opacity: 0.86,
                width: 'fit-content',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M20 12.05C20 16.44 16.42 20 12 20C10.55 20 9.2 19.62 8.04 18.94L4.6 20L5.73 16.73C5 15.52 4.58 14.1 4.58 12.6C4.58 8.2 8.16 4.64 12.58 4.64C17 4.64 20.58 8.2 20.58 12.6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15.93 13.88L14.75 15.05C14.47 15.33 14.05 15.42 13.68 15.29C12.33 14.8 11.14 13.86 10.32 12.71C10.08 12.37 10.12 11.9 10.4 11.62L11.44 10.58C11.68 10.34 11.75 9.97 11.62 9.66L10.97 8.06C10.78 7.61 10.28 7.39 9.83 7.56L8.76 7.97C8.3 8.15 8 8.6 8 9.09C8 13.01 11.19 16.2 15.11 16.2C15.6 16.2 16.05 15.9 16.23 15.44L16.64 14.37C16.81 13.92 16.59 13.42 16.14 13.23L14.54 12.58"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {copy.whatsappCta}
            </a>
          </div>
        </section>
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