'use client';

import { useLang } from './LanguageContext';

export default function SiteFooter() {
  const { t } = useLang();

  return (
    <footer
      className="py-10 px-8 md:px-16 text-center"
      style={{ borderTop: '1px solid var(--rule-color)' }}
    >
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
        {t?.footerCopy}
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
        {t?.footerTagline}
      </p>
    </footer>
  );
}