'use client';

import { useEffect, useRef } from 'react';
import { useLang } from './LanguageContext';

export default function HeroSection() {
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const { t } = useLang();

  useEffect(() => {
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const runEntrance = async () => {
      await delay(200);
      if (line1Ref.current) line1Ref.current.classList.add('revealed');
      await delay(180);
      if (line2Ref.current) line2Ref.current.classList.add('revealed');
      await delay(400);
      if (taglineRef.current) {
        taglineRef.current.style.opacity = '1';
        taglineRef.current.style.transform = 'translateY(0)';
      }
      await delay(300);
      if (scrollRef.current) {
        scrollRef.current.style.opacity = '1';
      }
      if (portraitRef.current) {
        portraitRef.current.style.opacity = '1';
        portraitRef.current.style.transform = 'translateY(0)';
      }
    };

    runEntrance();
  }, []);

  return (
    <section
      className="relative min-h-screen flex items-center hero-vignette overflow-hidden"
      style={{ paddingTop: '6rem', paddingBottom: '4rem' }}
      aria-label="Hero"
    >
      {/* Background subtle texture lines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 80px,
            rgba(200,169,110,0.025) 80px,
            rgba(200,169,110,0.025) 81px
          )`,
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full px-6 md:px-16 lg:px-24">
        <div className="flex flex-col lg:flex-row lg:items-stretch gap-10 lg:gap-0">

          {/* ── LEFT: Typography ── */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              {/* Label */}
              <p
                className="font-mono-body mb-8 md:mb-12"
                style={{
                  fontSize: '0.65rem',
                  letterSpacing: '0.45em',
                  color: 'var(--faded-gold)',
                  textTransform: 'uppercase',
                  opacity: 0.7,
                }}
              >
                {t.heroLabel}
              </p>

              {/* Hero H1 */}
              <h1 aria-label="Serbero Ink">
                <span className="hero-title-line" style={{ marginBottom: '-0.05em' }}>
                  <span
                    ref={line1Ref}
                    className="hero-title-inner font-serif-display"
                    style={{
                      fontSize: 'clamp(3.5rem, 13vw, 13rem)',
                      fontWeight: 900,
                      fontStyle: 'italic',
                      lineHeight: 0.88,
                      color: 'var(--parchment)',
                      letterSpacing: '-0.02em',
                      display: 'block',
                    }}
                  >
                    SERBERO
                  </span>
                </span>
                <span className="hero-title-line">
                  <span
                    ref={line2Ref}
                    className="hero-title-inner font-serif-display"
                    style={{
                      fontSize: 'clamp(3.5rem, 13vw, 13rem)',
                      fontWeight: 900,
                      fontStyle: 'italic',
                      lineHeight: 0.88,
                      color: 'var(--blood-red)',
                      letterSpacing: '-0.02em',
                      display: 'block',
                    }}
                  >
                    INK.
                  </span>
                </span>
              </h1>

              {/* Tagline */}
              <p
                ref={taglineRef}
                className="font-mono-body mt-6 md:mt-10"
                style={{
                  fontSize: 'clamp(0.65rem, 1.2vw, 0.85rem)',
                  letterSpacing: '0.25em',
                  color: 'var(--muted-parchment)',
                  fontStyle: 'italic',
                  opacity: 0,
                  transform: 'translateY(16px)',
                  transition: 'opacity 1s ease, transform 1s cubic-bezier(0.16,1,0.3,1)',
                }}
              >
                {t.heroTagline}
              </p>
            </div>

            {/* Bottom: scroll line + indicator */}
            <div
              ref={scrollRef}
              className="mt-12 lg:mt-0"
              style={{ opacity: 0, transition: 'opacity 1.2s ease' }}
            >
              <div className="scroll-line mb-4" style={{ maxWidth: '280px' }} />
              <div className="flex items-center gap-4">
                <span
                  className="scroll-indicator font-mono-body"
                  style={{
                    fontSize: '1.1rem',
                    color: 'var(--faded-gold)',
                    opacity: 0.7,
                  }}
                  aria-hidden="true"
                >
                  ↓
                </span>
                <span
                  className="font-mono-body"
                  style={{
                    fontSize: '0.62rem',
                    letterSpacing: '0.35em',
                    color: 'var(--muted-parchment)',
                    textTransform: 'uppercase',
                  }}
                >
                  {t.heroScroll}
                </span>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Portrait ── */}
          <div
            className="lg:pl-16 flex items-center justify-center lg:justify-end"
            style={{ flexShrink: 0 }}
          >
            <div
              ref={portraitRef}
              className="portrait-placeholder img-grain"
              style={{
                width: 'clamp(160px, 28vw, 380px)',
                aspectRatio: '2/3',
                opacity: 0,
                transform: 'translateY(30px)',
                transition: 'opacity 1.4s ease, transform 1.4s cubic-bezier(0.16,1,0.3,1)',
              }}
              role="img"
              aria-label="Tattoo artist portrait placeholder — client will replace with photo"
            >
              {/* Decorative inner content */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-end pb-8"
                style={{ zIndex: 3 }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '1px',
                    backgroundColor: 'var(--rule-color)',
                    marginBottom: '12px',
                  }}
                />
                <span
                  className="font-mono-body"
                  style={{
                    fontSize: '0.58rem',
                    letterSpacing: '0.4em',
                    color: 'var(--muted-parchment)',
                    textTransform: 'uppercase',
                  }}
                >
                  {t.heroArtist}
                </span>
              </div>
              {/* Faint grid lines on portrait */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(200,169,110,0.04) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(200,169,110,0.04) 1px, transparent 1px)
                  `,
                  backgroundSize: '32px 32px',
                  zIndex: 2,
                }}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}