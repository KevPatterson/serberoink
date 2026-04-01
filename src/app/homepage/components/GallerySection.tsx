'use client';

import { useLang } from './LanguageContext';

export default function GallerySection() {
  const { t } = useLang();

  const galleryItems = [
    { id: 1, colSpan: 1, aspect: '3/4', bg: 'gp-1', label: t.galleryItem1 },
    { id: 2, colSpan: 2, aspect: '4/3', bg: 'gp-2', label: t.galleryItem2 },
    { id: 3, colSpan: 2, aspect: '4/3', bg: 'gp-3', label: t.galleryItem3 },
    { id: 4, colSpan: 1, aspect: '3/4', bg: 'gp-4', label: t.galleryItem4 },
    { id: 5, colSpan: 1, aspect: '3/4', bg: 'gp-5', label: t.galleryItem5 },
    { id: 6, colSpan: 1, aspect: '3/4', bg: 'gp-6', label: t.galleryItem6 },
    { id: 7, colSpan: 1, aspect: '3/4', bg: 'gp-7', label: t.galleryItem7 },
  ];

  const descLines = t.galleryDesc.split('\n');

  return (
    <section
      className="reveal-section py-16 md:py-28 px-6 md:px-16 lg:px-24"
      aria-labelledby="gallery-heading"
    >
      <div className="max-w-6xl mx-auto">

        {/* Off-center heading */}
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
              {t.galleryLabel}
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
              THE<br />WORK.
            </h2>
          </div>
          <p
            className="font-mono-body md:text-right"
            style={{
              fontSize: '0.72rem',
              lineHeight: 1.9,
              color: 'var(--muted-parchment)',
              maxWidth: '240px',
            }}
          >
            {descLines.map((line, i) => (
              <span key={i}>{line}{i < descLines.length - 1 && <br />}</span>
            ))}
          </p>
        </div>

        {/* Asymmetric gallery grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">

          {/* Row 1 */}
          <div
            className="gallery-img col-span-1"
            style={{ aspectRatio: '3/4' }}
            role="img"
            aria-label={galleryItems[0].label}
          >
            <div className={`w-full h-full ${galleryItems[0].bg}`} />
            <GalleryLabel label={galleryItems[0].label} />
          </div>
          <div
            className="gallery-img col-span-1 md:col-span-2"
            style={{ aspectRatio: '4/3' }}
            role="img"
            aria-label={galleryItems[1].label}
          >
            <div className={`w-full h-full ${galleryItems[1].bg}`} />
            <GalleryLabel label={galleryItems[1].label} />
          </div>

          {/* Row 2 */}
          <div
            className="gallery-img col-span-2 md:col-span-2"
            style={{ aspectRatio: '16/9' }}
            role="img"
            aria-label={galleryItems[2].label}
          >
            <div className={`w-full h-full ${galleryItems[2].bg}`} />
            <GalleryLabel label={galleryItems[2].label} />
          </div>
          <div
            className="gallery-img col-span-2 md:col-span-1"
            style={{ aspectRatio: '3/4' }}
            role="img"
            aria-label={galleryItems[3].label}
          >
            <div className={`w-full h-full ${galleryItems[3].bg}`} />
            <GalleryLabel label={galleryItems[3].label} />
          </div>

          {/* Row 3 */}
          <div
            className="gallery-img col-span-1"
            style={{ aspectRatio: '3/4' }}
            role="img"
            aria-label={galleryItems[4].label}
          >
            <div className={`w-full h-full ${galleryItems[4].bg}`} />
            <GalleryLabel label={galleryItems[4].label} />
          </div>
          <div
            className="gallery-img col-span-1"
            style={{ aspectRatio: '3/4' }}
            role="img"
            aria-label={galleryItems[5].label}
          >
            <div className={`w-full h-full ${galleryItems[5].bg}`} />
            <GalleryLabel label={galleryItems[5].label} />
          </div>
          <div
            className="gallery-img col-span-2 md:col-span-1"
            style={{ aspectRatio: '3/4' }}
            role="img"
            aria-label={galleryItems[6].label}
          >
            <div className={`w-full h-full ${galleryItems[6].bg}`} />
            <GalleryLabel label={galleryItems[6].label} />
          </div>
        </div>

        {/* Bottom note */}
        <p
          className="font-mono-body mt-8 md:mt-10 text-center"
          style={{
            fontSize: '0.62rem',
            letterSpacing: '0.35em',
            color: 'var(--faded-gold)',
            textTransform: 'uppercase',
            opacity: 0.5,
          }}
        >
          {t.galleryNote}
        </p>
      </div>
    </section>
  );
}

function GalleryLabel({ label }: { label: string }) {
  return (
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
        {label}
      </p>
    </div>
  );
}