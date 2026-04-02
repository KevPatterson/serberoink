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
      id: 'snake',
      label: specialties.items[0],
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M8 38 C8 38 12 44 20 40 C28 36 28 28 20 26 C12 24 10 18 16 14 C22 10 30 12 32 18" />
          <path d="M32 18 C34 22 32 27 28 28" />
          <circle cx="33" cy="15" r="1.5" fill="currentColor" stroke="none" />
          <path d="M31 13 L33 15 L35 13" />
        </svg>
      ),
    },
    {
      id: 'dagger',
      label: specialties.items[1],
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="24" y1="6" x2="24" y2="36" />
          <path d="M20 12 L24 6 L28 12" />
          <rect x="18" y="33" width="12" height="3" rx="0" />
          <path d="M20 36 L20 42 L24 40 L28 42 L28 36" />
        </svg>
      ),
    },
    {
      id: 'rose',
      label: specialties.items[2],
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M24 38 L24 22" />
          <path d="M18 30 C18 30 16 24 20 22" />
          <path d="M30 30 C30 30 32 24 28 22" />
          <path d="M24 22 C24 22 18 18 18 13 C18 10 21 8 24 10 C27 8 30 10 30 13 C30 18 24 22 24 22Z" />
          <path d="M21 12 C21 12 20 16 24 17" />
          <path d="M24 38 C24 38 20 42 18 44" />
          <path d="M24 38 C24 38 28 42 30 44" />
        </svg>
      ),
    },
    {
      id: 'compass',
      label: specialties.items[3],
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="24" cy="24" r="14" />
          <circle cx="24" cy="24" r="2" />
          <line x1="24" y1="10" x2="24" y2="16" />
          <line x1="24" y1="32" x2="24" y2="38" />
          <line x1="10" y1="24" x2="16" y2="24" />
          <line x1="32" y1="24" x2="38" y2="24" />
          <line x1="24" y1="10" x2="27" y2="7" />
          <line x1="24" y1="38" x2="21" y2="41" />
        </svg>
      ),
    },
    {
      id: 'moth',
      label: specialties.items[4],
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M24 14 L24 34" />
          <path d="M24 18 C20 14 10 12 10 20 C10 26 18 26 24 22" />
          <path d="M24 18 C28 14 38 12 38 20 C38 26 30 26 24 22" />
          <path d="M24 28 C20 26 14 28 14 34 C14 38 20 36 24 32" />
          <path d="M24 28 C28 26 34 28 34 34 C34 38 28 36 24 32" />
          <circle cx="22" cy="14" r="1" fill="currentColor" stroke="none" />
          <circle cx="26" cy="14" r="1" fill="currentColor" stroke="none" />
          <path d="M22 12 L20 9 M26 12 L28 9" />
        </svg>
      ),
    },
    {
      id: 'skull',
      label: specialties.items[5],
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M14 28 C14 18 18 10 24 10 C30 10 34 18 34 28 L34 32 L14 32 Z" />
          <rect x="16" y="32" width="16" height="6" rx="0" />
          <line x1="20" y1="32" x2="20" y2="38" />
          <line x1="24" y1="32" x2="24" y2="38" />
          <line x1="28" y1="32" x2="28" y2="38" />
          <ellipse cx="20" cy="24" rx="3" ry="3.5" />
          <ellipse cx="28" cy="24" rx="3" ry="3.5" />
          <path d="M24 27 L23 30 L25 30 Z" />
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