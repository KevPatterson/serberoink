'use client';

import { useLang } from './LanguageContext';

export default function AboutSection() {
  const { t } = useLang();
  const headingLines = t?.aboutHeading?.split('\n');

  return (
    <section
      className="reveal-section py-16 md:py-28 px-6 md:px-16 lg:px-24"
      aria-labelledby="about-heading"
    >
      <div className="max-w-6xl mx-auto">

        {/* Section label */}
        <p
          className="font-mono-body mb-10 md:mb-16"
          style={{
            fontSize: '0.62rem',
            letterSpacing: '0.5em',
            color: 'var(--faded-gold)',
            textTransform: 'uppercase',
            opacity: 0.7,
          }}
        >
          {t?.aboutLabel}
        </p>

        <div className="flex flex-col md:flex-row gap-10 md:gap-0">

          {/* ── LEFT: Bio ── */}
          <div className="flex-1 md:pr-12 lg:pr-20">
            <h2
              id="about-heading"
              className="font-serif-display mb-8"
              style={{
                fontSize: 'clamp(1.9rem, 5vw, 4rem)',
                fontWeight: 700,
                fontStyle: 'italic',
                lineHeight: 1.05,
                color: 'var(--parchment)',
                letterSpacing: '-0.01em',
              }}
            >
              {headingLines?.[0]}<br />{headingLines?.[1]}
            </h2>

            <p
              className="drop-cap font-mono-body mb-6"
              style={{
                fontSize: '0.82rem',
                lineHeight: 1.9,
                color: 'var(--muted-parchment)',
              }}
            >
              {t?.aboutBio1}
            </p>

            <p
              className="font-mono-body mb-8"
              style={{
                fontSize: '0.82rem',
                lineHeight: 1.9,
                color: 'var(--muted-parchment)',
              }}
            >
              {t?.aboutBio2}
            </p>

            {/* Pull quote */}
            <blockquote
              className="font-serif-display mt-10 pl-6"
              style={{
                borderLeft: '1px solid var(--blood-red)',
                fontStyle: 'italic',
                fontSize: 'clamp(1rem, 2.2vw, 1.5rem)',
                fontWeight: 400,
                color: 'var(--parchment)',
                lineHeight: 1.45,
              }}
            >
              {t?.aboutQuote}
            </blockquote>
          </div>

          {/* ── Vertical Rule (desktop only) ── */}
          <div
            className="hidden md:block vertical-rule mx-6 lg:mx-10"
            aria-hidden="true"
          />

          {/* ── RIGHT: Image ── */}
          <div
            className="md:w-56 lg:w-80 flex-shrink-0 flex flex-col justify-start gap-6"
          >
            {/* Square image placeholder */}
            <div
              className="about-img-placeholder img-grain w-full"
              role="img"
              aria-label="Artist at work — placeholder image"
              style={{ borderRadius: 0 }}
            />

            {/* Metadata below image */}
            <div
              className="font-mono-body"
              style={{
                fontSize: '0.62rem',
                letterSpacing: '0.3em',
                color: 'var(--faded-gold)',
                textTransform: 'uppercase',
                opacity: 0.6,
                lineHeight: 2,
              }}
            >
              <p>{t?.aboutLocation}</p>
              <p>{t?.aboutAppointment}</p>
              <p>{t?.aboutEst}</p>
            </div>

            {/* Small decorative rule */}
            <div
              style={{
                width: '48px',
                height: '1px',
                backgroundColor: 'var(--rule-color)',
              }}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </section>
  );
}