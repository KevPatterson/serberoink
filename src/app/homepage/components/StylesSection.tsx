'use client';

import { useRef } from 'react';

interface StylesSectionProps {
  specialties: {
    sectionNumber: string;
    sectionLabel: string;
    items: string[];
  };
}

interface StyleCardProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  index: number;
  borderRight: boolean;
  borderBottom: boolean;
}

function StyleCard({ id, label, icon, borderRight, borderBottom }: StyleCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    card.style.transform = `perspective(600px) rotateX(${-dy * 4}deg) rotateY(${dx * 4}deg) translateZ(4px)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    card.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1), background 0.3s ease';
  };

  const handleMouseEnter = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transition = 'transform 0.1s ease, background 0.3s ease';
  };

  return (
    <div
      ref={cardRef}
      key={id}
      className="style-card"
      style={{
        borderRight: borderRight ? '1px solid var(--rule-color)' : 'none',
        borderBottom: borderBottom ? '1px solid var(--rule-color)' : 'none',
        willChange: 'transform',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      <div
        className="flex justify-center mb-4 md:mb-5 style-card-icon"
        style={{ color: 'var(--faded-gold)' }}
      >
        {icon}
      </div>
      <p
        className="font-mono-body"
        style={{
          fontSize: '0.58rem',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: 'var(--parchment)',
          opacity: 0.8,
        }}
      >
        {label}
      </p>
    </div>
  );
}

export default function StylesSection({ specialties }: StylesSectionProps) {
  const specialtyCards = [
    {
      id: 'realism',
      label: specialties.items[0],
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M24 7 C17 7 14 12 14 20 C14 28 17 34 24 34 C31 34 34 28 34 20 C34 12 31 7 24 7 Z" />
          <ellipse cx="20.3" cy="17.2" rx="2.8" ry="1.8" />
          <ellipse cx="27.7" cy="17.2" rx="2.8" ry="1.8" />
          <circle cx="20.3" cy="17.2" r="0.7" fill="currentColor" stroke="none" />
          <circle cx="27.7" cy="17.2" r="0.7" fill="currentColor" stroke="none" />
          <path d="M22.2 21.3 C23 22.3 25 22.3 25.8 21.3" />
          <path d="M20.2 24.3 C21.5 25.4 23 25.9 24 25.9 C25 25.9 26.5 25.4 27.8 24.3" />
          <path d="M16.5 15.5 C16.1 19.4 16.2 24.5 18.7 28.4" />
          <path d="M31.5 15.8 C32.2 18.8 32.2 21.8 31.1 24.6" />
          <path d="M31 25.8 L33 28.7" />
          <path d="M17.8 33.8 L17.8 39" />
          <path d="M24 33.8 L24 39" />
        </svg>
      ),
    },
    {
      id: 'anime',
      label: specialties.items[1],
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path
            d="M9.5 29.8C7.3 29 5.8 26.9 5.8 24.3c0-3.3 2.6-6 5.9-6.2c1.3-4.8 5.7-8.3 10.8-8.3c5.1 0 9.4 3.4 10.8 8.1c0.5-0.1 1-0.2 1.6-0.2c3.8 0 6.8 3 6.8 6.7c0 3.7-3 6.8-6.8 6.8H13.7"
          />
          <path d="M16.5 32.6h13.1c2.9 0 5.2 2.3 5.2 5.2S32.5 43 29.6 43H16.5c-2.9 0-5.2-2.3-5.2-5.2s2.3-5.2 5.2-5.2Z" />
          <path d="M19.2 22.2c0.8-1.7 2.5-2.9 4.5-2.9" />
          <path d="M24.9 21.4c1.9 0 3.5 1 4.4 2.6" />
        </svg>
      ),
    },
    {
      id: 'blackwork',
      label: specialties.items[2],
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="24" cy="24" r="14" />
          <circle cx="24" cy="24" r="11" />
          <circle cx="24" cy="24" r="2" fill="currentColor" stroke="none" />
          <ellipse cx="24" cy="15.8" rx="2.5" ry="4.9" fill="currentColor" stroke="none" />
          <ellipse cx="30.7" cy="18.8" rx="2" ry="4.2" transform="rotate(45 30.7 18.8)" fill="currentColor" stroke="none" />
          <ellipse cx="32.2" cy="24" rx="4.9" ry="2.5" fill="currentColor" stroke="none" />
          <ellipse cx="30.7" cy="29.2" rx="2" ry="4.2" transform="rotate(135 30.7 29.2)" fill="currentColor" stroke="none" />
          <ellipse cx="24" cy="32.2" rx="2.5" ry="4.9" fill="currentColor" stroke="none" />
          <ellipse cx="17.3" cy="29.2" rx="2" ry="4.2" transform="rotate(45 17.3 29.2)" fill="currentColor" stroke="none" />
          <ellipse cx="15.8" cy="24" rx="4.9" ry="2.5" fill="currentColor" stroke="none" />
          <ellipse cx="17.3" cy="18.8" rx="2" ry="4.2" transform="rotate(135 17.3 18.8)" fill="currentColor" stroke="none" />
          <circle cx="24" cy="9.5" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="33" cy="12.9" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="38.3" cy="20.9" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="38.3" cy="27.1" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="33" cy="35.1" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="24" cy="38.5" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="15" cy="35.1" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="9.7" cy="27.1" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="9.7" cy="20.9" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="15" cy="12.9" r="1.2" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
    {
      id: 'neotraditional',
      label: specialties.items[3],
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M16 13 C13.8 11.2 12.8 8.9 12.6 6.3 C14.8 7.3 16.5 9.1 17.3 11.5" />
          <path d="M32 13 C34.2 11.2 35.2 8.9 35.4 6.3 C33.2 7.3 31.5 9.1 30.7 11.5" />
          <path d="M17 12.6 C18.8 10.9 21 10 24 10 C27 10 29.2 10.9 31 12.6 L30 15.8 C28 14.6 26.2 14.1 24 14.1 C21.8 14.1 20 14.6 18 15.8 Z" fill="currentColor" stroke="none" />
          <path d="M12 18.5 C16.4 17.4 20.1 17 24 17 C27.9 17 31.6 17.4 36 18.5" />
          <path d="M12 18.5 C12.8 20 13.7 21.2 15.2 22.2" />
          <path d="M36 18.5 C35.2 20 34.3 21.2 32.8 22.2" />
          <path d="M14.8 22.2 L13.4 31.4 C16.8 32.6 20.2 33.2 24 33.2 C27.8 33.2 31.2 32.6 34.6 31.4 L33.2 22.2" fill="currentColor" stroke="none" />
          <path d="M17.8 22.2 C17.8 23.9 18.7 25.3 20 26.2 C21.3 25.3 22.2 23.9 22.2 22.2" fill="#0a0a0a" stroke="none" />
          <path d="M25.8 22.2 C25.8 23.9 26.7 25.3 28 26.2 C29.3 25.3 30.2 23.9 30.2 22.2" fill="#0a0a0a" stroke="none" />
          <path d="M20.2 28.1 C21.3 29 22.6 29.5 24 29.5 C25.4 29.5 26.7 29 27.8 28.1" fill="#0a0a0a" stroke="none" />
          <path d="M19.2 33.2 L18 37.8" />
          <path d="M24 33.2 L24 39.6" />
          <path d="M28.8 33.2 L30 37.8" />
          <path d="M20 39.6 C21.3 40.8 22.6 41.5 24 41.5 C25.4 41.5 26.7 40.8 28 39.6" />
        </svg>
      ),
    },
    {
      id: 'dark-fantasy',
      label: specialties.items[4],
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M24 7.8 L17.2 14.9 L30.8 14.9 Z" fill="#d8b15b" stroke="none" />
          <path d="M17.2 14.9 L17.2 30.2 C17.2 35.1 20.3 38.8 24 38.8 C27.7 38.8 30.8 35.1 30.8 30.2 L30.8 14.9 Z" fill="#d8b15b" stroke="none" />
          <path d="M21.1 22.8 L24 20.5 L26.9 22.8" fill="#0a0a0a" stroke="none" />
          <path d="M22.2 38.8 L22.2 42" />
          <path d="M25.8 38.8 L25.8 42" />
        </svg>
      ),
    },
    {
      id: 'dotwork',
      label: specialties.items[5],
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="24" cy="10" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="19" cy="12" r="1.1" fill="currentColor" stroke="none" />
          <circle cx="29" cy="12" r="1.1" fill="currentColor" stroke="none" />
          <circle cx="15" cy="15" r="1.1" fill="currentColor" stroke="none" />
          <circle cx="33" cy="15" r="1.1" fill="currentColor" stroke="none" />
          <circle cx="12" cy="20" r="1.1" fill="currentColor" stroke="none" />
          <circle cx="24" cy="15" r="1" fill="currentColor" stroke="none" />
          <circle cx="36" cy="20" r="1.1" fill="currentColor" stroke="none" />
          <circle cx="10" cy="24" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="14" cy="24" r="1.1" fill="currentColor" stroke="none" />
          <circle cx="18" cy="24" r="1" fill="currentColor" stroke="none" />
          <circle cx="24" cy="24" r="2" fill="currentColor" stroke="none" />
          <circle cx="30" cy="24" r="1" fill="currentColor" stroke="none" />
          <circle cx="34" cy="24" r="1.1" fill="currentColor" stroke="none" />
          <circle cx="38" cy="24" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="12" cy="28" r="1.1" fill="currentColor" stroke="none" />
          <circle cx="16" cy="30" r="1" fill="currentColor" stroke="none" />
          <circle cx="20" cy="31.5" r="1" fill="currentColor" stroke="none" />
          <circle cx="28" cy="31.5" r="1" fill="currentColor" stroke="none" />
          <circle cx="32" cy="30" r="1" fill="currentColor" stroke="none" />
          <circle cx="36" cy="28" r="1.1" fill="currentColor" stroke="none" />
          <circle cx="15" cy="34" r="1.1" fill="currentColor" stroke="none" />
          <circle cx="21" cy="35.5" r="1.1" fill="currentColor" stroke="none" />
          <circle cx="27" cy="35.5" r="1.1" fill="currentColor" stroke="none" />
          <circle cx="33" cy="34" r="1.1" fill="currentColor" stroke="none" />
          <circle cx="19" cy="39" r="1.1" fill="currentColor" stroke="none" />
          <circle cx="24" cy="41" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="29" cy="39" r="1.1" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
  ];

  return (
    <section
      className="reveal-section py-16 md:py-28 px-6 md:px-16 lg:px-24"
      aria-labelledby="styles-heading"
    >
      <div className="max-w-6xl mx-auto">

        {/* Section label */}
        <p
          className="font-mono-body mb-6"
          style={{
            fontSize: '0.62rem',
            letterSpacing: '0.5em',
            color: 'var(--faded-gold)',
            textTransform: 'uppercase',
            opacity: 0.7,
          }}
        >
          {specialties.sectionNumber} - {specialties.sectionLabel}
        </p>

        <h2
          id="styles-heading"
          className="font-serif-display mb-12 md:mb-20"
          style={{
            fontSize: 'clamp(1.8rem, 4.5vw, 3.5rem)',
            fontWeight: 700,
            fontStyle: 'italic',
            lineHeight: 1.05,
            color: 'var(--parchment)',
            letterSpacing: '-0.01em',
          }}
        >
          {specialties.sectionLabel}
        </h2>

        {/* 6-card grid */}
        <div
          className="grid grid-cols-2 md:grid-cols-3 gap-0"
          style={{ borderTop: '1px solid var(--rule-color)' }}
        >
          {specialtyCards?.map((item, i) => (
            <StyleCard
              key={item?.id}
              id={item?.id}
              label={item?.label ?? ''}
              icon={item?.icon}
              index={i}
              borderRight={(i + 1) % 3 !== 0 && i < 5}
              borderBottom={i < 3}
            />
          ))}
        </div>
      </div>
    </section>
  );
}