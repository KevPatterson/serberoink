'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { useUIStrings } from '@/hooks/useUIStrings';

interface HeroSectionProps {
  hero: {
    title: string;
    tagline: string;
    scrollText: string;
    artistImageSrc: string;
    artistImageAlt: string;
  };
}

export default function HeroSection({ hero }: HeroSectionProps) {
  const ui = useUIStrings();
  const hasArtistImage = hero.artistImageSrc.trim().length > 0;
  const heroRef = useRef<HTMLElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const runEntrance = async () => {
      if (line1Ref.current) line1Ref.current.classList.remove('revealed');
      if (line2Ref.current) line2Ref.current.classList.remove('revealed');
      if (taglineRef.current) {
        taglineRef.current.style.opacity = '0';
        taglineRef.current.style.transform = 'translateY(16px)';
      }
      if (scrollRef.current) {
        scrollRef.current.style.opacity = '0';
      }
      if (portraitRef.current) {
        portraitRef.current.style.opacity = '0';
        portraitRef.current.style.transform = 'translateY(30px)';
      }

      await delay(200);
      if (cancelled) return;
      if (line1Ref.current) line1Ref.current.classList.add('revealed');
      await delay(180);
      if (cancelled) return;
      if (line2Ref.current) line2Ref.current.classList.add('revealed');
      await delay(400);
      if (cancelled) return;
      if (taglineRef.current) {
        taglineRef.current.style.opacity = '1';
        taglineRef.current.style.transform = 'translateY(0)';
      }
      await delay(300);
      if (cancelled) return;
      if (scrollRef.current) {
        scrollRef.current.style.opacity = '1';
      }
      if (portraitRef.current) {
        portraitRef.current.style.opacity = '1';
        portraitRef.current.style.transform = 'translateY(0)';
      }
    };

    runEntrance();

    return () => {
      cancelled = true;
    };
  }, [hero.title, hero.tagline, hero.scrollText, hasArtistImage]);

  useEffect(() => {
    const section = heroRef.current;
    if (!section) return;
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const updateParallax = (event: PointerEvent) => {
      const rect = section.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      const rotateY = (px - 0.5) * 8;
      const rotateX = (0.5 - py) * 8;

      section.style.setProperty('--hero-tilt-x', `${rotateX.toFixed(2)}deg`);
      section.style.setProperty('--hero-tilt-y', `${rotateY.toFixed(2)}deg`);
    };

    const resetParallax = () => {
      section.style.setProperty('--hero-tilt-x', '0deg');
      section.style.setProperty('--hero-tilt-y', '0deg');
    };

    section.addEventListener('pointermove', updateParallax);
    section.addEventListener('pointerleave', resetParallax);

    return () => {
      section.removeEventListener('pointermove', updateParallax);
      section.removeEventListener('pointerleave', resetParallax);
    };
  }, []);

  return (
    <section
      ref={heroRef}
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
                {hero.title}
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
                <span className="hero-title-line hero-title-line-ink">
                  <span className="hero-ink-wrap">
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
                    <span className="hero-machine-3d" aria-hidden="true">
                      <svg
                        className="hero-machine-svg"
                        viewBox="0 0 120 160"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          x="35"
                          y="20"
                          width="50"
                          height="70"
                          rx="6"
                          fill="#1a1410"
                          stroke="#C8A96E"
                          strokeWidth="1.2"
                        />
                        <ellipse
                          cx="60"
                          cy="20"
                          rx="18"
                          ry="6"
                          fill="#111"
                          stroke="#C8A96E"
                          strokeWidth="1"
                        />
                        <line
                          x1="42"
                          y1="20"
                          x2="42"
                          y2="55"
                          stroke="#C8A96E"
                          strokeWidth="0.8"
                          strokeDasharray="3 2"
                        />
                        <line
                          x1="78"
                          y1="20"
                          x2="78"
                          y2="55"
                          stroke="#C8A96E"
                          strokeWidth="0.8"
                          strokeDasharray="3 2"
                        />
                        <rect
                          x="47"
                          y="90"
                          width="26"
                          height="40"
                          rx="4"
                          fill="#0f0d0b"
                          stroke="#C8A96E"
                          strokeWidth="1"
                        />
                        <line
                          x1="47"
                          y1="100"
                          x2="73"
                          y2="100"
                          stroke="#C8A96E"
                          strokeWidth="0.5"
                          opacity="0.5"
                        />
                        <line
                          x1="47"
                          y1="108"
                          x2="73"
                          y2="108"
                          stroke="#C8A96E"
                          strokeWidth="0.5"
                          opacity="0.5"
                        />
                        <line
                          x1="47"
                          y1="116"
                          x2="73"
                          y2="116"
                          stroke="#C8A96E"
                          strokeWidth="0.5"
                          opacity="0.5"
                        />
                        <line
                          x1="47"
                          y1="124"
                          x2="73"
                          y2="124"
                          stroke="#C8A96E"
                          strokeWidth="0.5"
                          opacity="0.5"
                        />
                        <rect
                          x="57"
                          y="130"
                          width="6"
                          height="20"
                          rx="2"
                          fill="#C8A96E"
                          opacity="0.9"
                        />
                        <polygon points="57,150 63,150 60,160" fill="#C8A96E" />
                        <ellipse
                          className="ink-drop hero-machine-drop"
                          cx="60"
                          cy="162"
                          rx="3"
                          ry="2"
                          fill="#8B0000"
                          opacity="0.85"
                        />
                        <circle
                          className="hero-blood-splash hero-blood-splash-right hero-blood-splash-1"
                          cx="66"
                          cy="160"
                          r="1.4"
                          fill="#8B0000"
                        />
                        <ellipse
                          className="hero-blood-splash hero-blood-splash-right hero-blood-splash-2"
                          cx="70"
                          cy="156"
                          rx="1.8"
                          ry="1.2"
                          fill="#8B0000"
                        />
                        <circle
                          className="hero-blood-splash hero-blood-splash-right hero-blood-splash-3"
                          cx="73"
                          cy="151"
                          r="1.1"
                          fill="#8B0000"
                        />
                        <ellipse
                          className="hero-blood-splash hero-blood-splash-right hero-blood-splash-4"
                          cx="76"
                          cy="147"
                          rx="1.3"
                          ry="0.95"
                          fill="#8B0000"
                        />
                        <circle
                          className="hero-blood-splash hero-blood-splash-left hero-blood-splash-5"
                          cx="54"
                          cy="160"
                          r="1.35"
                          fill="#8B0000"
                        />
                        <ellipse
                          className="hero-blood-splash hero-blood-splash-left hero-blood-splash-6"
                          cx="50"
                          cy="156"
                          rx="1.7"
                          ry="1.15"
                          fill="#8B0000"
                        />
                        <circle
                          className="hero-blood-splash hero-blood-splash-left hero-blood-splash-7"
                          cx="46"
                          cy="152"
                          r="1.05"
                          fill="#8B0000"
                        />
                        <ellipse
                          className="hero-blood-splash hero-blood-splash-left hero-blood-splash-8"
                          cx="43"
                          cy="148"
                          rx="1.25"
                          ry="0.9"
                          fill="#8B0000"
                        />
                        <circle
                          cx="45"
                          cy="30"
                          r="3"
                          fill="#0f0d0b"
                          stroke="#C8A96E"
                          strokeWidth="0.8"
                        />
                        <circle
                          cx="75"
                          cy="30"
                          r="3"
                          fill="#0f0d0b"
                          stroke="#C8A96E"
                          strokeWidth="0.8"
                        />
                        <line x1="43" y1="30" x2="47" y2="30" stroke="#C8A96E" strokeWidth="0.6" />
                        <line x1="73" y1="30" x2="77" y2="30" stroke="#C8A96E" strokeWidth="0.6" />
                      </svg>
                    </span>
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
                {hero.tagline}
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
                  {hero.scrollText || ui.scrollExplore}
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
              className="portrait-placeholder img-grain hero-portrait-3d"
              style={{
                width: 'clamp(160px, 28vw, 380px)',
                aspectRatio: '2/3',
                opacity: 0,
                transform: 'translateY(30px)',
                transition: 'opacity 1.4s ease, transform 1.4s cubic-bezier(0.16,1,0.3,1)',
              }}
              role="img"
              aria-label={
                hasArtistImage
                  ? hero.artistImageAlt || 'Tattoo artist portrait'
                  : 'Tattoo artist portrait placeholder'
              }
            >
              {hasArtistImage && (
                <Image
                  src={hero.artistImageSrc}
                  alt={hero.artistImageAlt || 'Tattoo artist portrait'}
                  fill
                  sizes="(max-width: 1024px) 60vw, 380px"
                  className="object-cover"
                  unoptimized
                />
              )}
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
                  {ui.theArtist}
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
