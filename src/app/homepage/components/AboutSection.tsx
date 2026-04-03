'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { useUIStrings } from '@/hooks/useUIStrings';
import { useLang } from './LanguageContext';

interface AboutSectionProps {
  about: {
    sectionNumber: string;
    sectionLabel: string;
    heading: string;
    bio: string;
    quote: string;
    location: string;
    details: string;
    established: string;
    imageSrc: string;
    imageAlt: string;
  };
}

export default function AboutSection({ about }: AboutSectionProps) {
  const ui = useUIStrings();
  const { lang } = useLang();
  const imageCardRef = useRef<HTMLDivElement>(null);
  const hasAboutImage = about.imageSrc.trim().length > 0;
  const headingLines = about.heading.split('\n');
  const normalizedSectionLabel = about.sectionLabel.trim().toLowerCase();
  const sectionLabel =
    lang === 'es' && normalizedSectionLabel === 'about' ? ui.sectionAboutLabel : about.sectionLabel;

  useEffect(() => {
    const card = imageCardRef.current;
    if (!card) return;
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const updateTilt = (event: PointerEvent) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      const rotateY = (px - 0.5) * 9;
      const rotateX = (0.5 - py) * 9;

      card.style.setProperty('--about-tilt-x', `${rotateX.toFixed(2)}deg`);
      card.style.setProperty('--about-tilt-y', `${rotateY.toFixed(2)}deg`);
      card.style.setProperty('--about-glint-x', `${(px * 100).toFixed(1)}%`);
      card.style.setProperty('--about-glint-y', `${(py * 100).toFixed(1)}%`);
    };

    const resetTilt = () => {
      card.style.setProperty('--about-tilt-x', '0deg');
      card.style.setProperty('--about-tilt-y', '0deg');
      card.style.setProperty('--about-glint-x', '50%');
      card.style.setProperty('--about-glint-y', '50%');
    };

    card.addEventListener('pointermove', updateTilt);
    card.addEventListener('pointerleave', resetTilt);

    return () => {
      card.removeEventListener('pointermove', updateTilt);
      card.removeEventListener('pointerleave', resetTilt);
    };
  }, []);

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
          {about.sectionNumber} - {sectionLabel}
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
              {headingLines?.[0]}
              <br />
              {headingLines?.[1]}
            </h2>

            <p
              className="drop-cap font-mono-body mb-6"
              style={{
                fontSize: '0.82rem',
                lineHeight: 1.9,
                color: 'var(--muted-parchment)',
              }}
            >
              {about.bio}
            </p>

            <p
              className="font-mono-body mb-8"
              style={{
                fontSize: '0.82rem',
                lineHeight: 1.9,
                color: 'var(--muted-parchment)',
              }}
            >
              {about.details}
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
              &ldquo;{about.quote}&rdquo;
            </blockquote>
          </div>

          {/* ── Vertical Rule (desktop only) ── */}
          <div className="hidden md:block vertical-rule mx-6 lg:mx-10" aria-hidden="true" />

          {/* ── RIGHT: Image ── */}
          <div className="md:w-56 lg:w-80 flex-shrink-0 flex flex-col justify-start gap-6">
            {/* Square image placeholder */}
            <div
              ref={imageCardRef}
              className="about-img-placeholder about-img-3d img-grain w-full relative"
              role="img"
              aria-label={
                hasAboutImage
                  ? about.imageAlt || 'Artist at work'
                  : 'Artist at work placeholder image'
              }
              style={{ borderRadius: 0 }}
            >
              {hasAboutImage && (
                <Image
                  src={about.imageSrc}
                  alt={about.imageAlt || 'Artist at work'}
                  fill
                  sizes="(max-width: 768px) 100vw, 320px"
                  className="object-cover"
                  unoptimized
                />
              )}
            </div>

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
              <p>{about.location}</p>
              <p>{about.details}</p>
              <p>{about.established}</p>
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
