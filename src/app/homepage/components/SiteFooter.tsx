'use client';

interface SiteFooterProps {
  footer: {
    brand: string;
    established: string;
    rights: string;
    tagline: string;
  };
}

export default function SiteFooter({ footer }: SiteFooterProps) {

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