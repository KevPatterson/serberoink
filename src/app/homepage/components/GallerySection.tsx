'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { PortfolioImage } from '@/lib/content';
import { useUIStrings } from '@/hooks/useUIStrings';
import { useLang } from './LanguageContext';

interface GallerySectionProps {
  portfolio: {
    sectionNumber: string;
    sectionLabel: string;
    subtitle: string;
    images: PortfolioImage[];
  };
  instagramUrl: string;
}

function useItemReveal(count: number) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const [visible, setVisible] = useState<boolean[]>(Array(count).fill(false));

  useEffect(() => {
    refs.current = refs.current.slice(0, count);
    setVisible(Array(count).fill(false));
  }, [count]);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(Array(count).fill(true));
      return;
    }

    const observers: IntersectionObserver[] = [];

    refs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setVisible((prev) => {
                const next = [...prev];
                next[i] = true;
                return next;
              });
            }, Math.min(i * 60, 900));
            obs.disconnect();
          }
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [count]);

  return { refs, visible };
}

function resolveAspect(index: number): string {
  const map = ['3/4', '4/3', '16/9', '3/4', '3/4', '3/4', '3/4'];
  return map[index % map.length] || '3/4';
}

export default function GallerySection({ portfolio, instagramUrl }: GallerySectionProps) {
  const ui = useUIStrings();
  const { lang } = useLang();
  const { refs, visible } = useItemReveal(portfolio.images.length);
  const normalizedSectionLabel = portfolio.sectionLabel.trim().toLowerCase();
  const localizedSectionLabel =
    lang === 'es' && (normalizedSectionLabel === 'the work.' || normalizedSectionLabel === 'the work')
      ? ui.sectionPortfolioLabel
      : portfolio.sectionLabel;

  return (
    <section
      className="reveal-section py-16 md:py-28 px-6 md:px-16 lg:px-24"
      aria-labelledby="gallery-heading"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '0 800px' } as React.CSSProperties}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 md:mb-16 gap-4">
          <div>
            <p
              className="font-mono-body mb-4"
              style={{
                fontSize: '0.62rem',
                letterSpacing: '0.5em',
                color: 'var(--faded-gold)',
                textTransform: 'uppercase',
                opacity: 0.7,
              }}
            >
              {portfolio.sectionNumber} - {ui.sectionPortfolioLabel}
            </p>
            <h2
              id="gallery-heading"
              className="font-serif-display"
              style={{
                fontSize: 'clamp(2.5rem, 8vw, 7rem)',
                fontWeight: 900,
                fontStyle: 'italic',
                lineHeight: 0.9,
                color: 'var(--parchment)',
                letterSpacing: '-0.02em',
              }}
            >
              {localizedSectionLabel}
            </h2>
          </div>
          <p
            className="font-mono-body md:text-right"
            style={{
              fontSize: '0.72rem',
              lineHeight: 1.9,
              color: 'var(--muted-parchment)',
              maxWidth: '280px',
            }}
          >
            {portfolio.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
          {portfolio.images.map((image, index) => (
            <div
              key={image.id}
              ref={(el) => {
                refs.current[index] = el;
              }}
              className={`gallery-img ${index % 4 === 2 ? 'col-span-2 md:col-span-2' : 'col-span-1'}`}
              style={{
                aspectRatio: resolveAspect(index),
                opacity: visible[index] ? 1 : 0,
                transform: visible[index] ? 'translateY(0)' : 'translateY(24px)',
                transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${index * 0.06}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${index * 0.06}s`,
              }}
              role="img"
              aria-label={`${image.title}, ${image.year}`}
            >
              <Image
                src={image.src}
                alt={`${image.title} ${image.year}`}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                style={{ objectFit: 'cover' }}
              />
              <div
                className="absolute bottom-0 left-0 right-0 p-3"
                style={{
                  background: 'linear-gradient(to top, rgba(10,10,10,0.85) 0%, transparent 100%)',
                  zIndex: 4,
                }}
              >
                <p
                  className="font-mono-body"
                  style={{
                    fontSize: '0.58rem',
                    letterSpacing: '0.28em',
                    color: 'rgba(240,234,214,0.6)',
                    textTransform: 'uppercase',
                  }}
                >
                  {image.title} - {image.year}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-10 md:mt-14">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-btn"
            aria-label={ui.portfolioInstagramButton}
          >
            {ui.portfolioInstagramButton}
          </a>
        </div>
      </div>
    </section>
  );
}
