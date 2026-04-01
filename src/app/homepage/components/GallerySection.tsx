'use client';

import { useLang } from './LanguageContext';
import { useEffect, useRef, useState } from 'react';

const GALLERY_STORAGE_KEY = 'serbero_gallery_images';

interface GalleryImage {
  id: number;
  src: string | null;
}

function useGalleryImages(): GalleryImage[] {
  const [images, setImages] = useState<GalleryImage[]>([
    { id: 1, src: null }, { id: 2, src: null }, { id: 3, src: null },
    { id: 4, src: null }, { id: 5, src: null }, { id: 6, src: null },
    { id: 7, src: null },
  ]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(GALLERY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, string>;
        setImages((prev) =>
          prev.map((img) => ({ ...img, src: parsed[img.id] ?? null }))
        );
      }
    } catch {
      // no-op
    }
  }, []);

  return images;
}

function useItemReveal(count: number) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const [visible, setVisible] = useState<boolean[]>(Array(count).fill(false));

  useEffect(() => {
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
            }, i * 80); // stagger 80ms per item
            obs.disconnect();
          }
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return { refs, visible };
}

interface GalleryItemProps {
  colClass: string;
  aspect: string;
  bgClass: string;
  label: string;
  imageSrc: string | null;
  index: number;
  isVisible: boolean;
  refCallback: (el: HTMLDivElement | null) => void;
}

function GalleryItem({ colClass, aspect, bgClass, label, imageSrc, index, isVisible, refCallback }: GalleryItemProps) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div
      ref={refCallback}
      className={`gallery-img ${colClass}`}
      style={{
        aspectRatio: aspect,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${index * 0.06}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${index * 0.06}s`,
      }}
      role="img"
      aria-label={label}
    >
      {imageSrc ? (
        <>
          {!imgLoaded && <div className={`gallery-skeleton w-full h-full ${bgClass}`} />}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={label}
            loading="lazy"
            decoding="async"
            className="gallery-img-inner"
            style={{
              opacity: imgLoaded ? 1 : 0,
              transition: 'opacity 0.5s ease',
              position: imgLoaded ? 'relative' : 'absolute',
              inset: 0,
            }}
            onLoad={() => setImgLoaded(true)}
          />
        </>
      ) : (
        <div className={`w-full h-full ${bgClass}`} />
      )}
      <GalleryLabel label={label} />
    </div>
  );
}

export default function GallerySection() {
  const { t } = useLang();
  const images = useGalleryImages();

  const galleryItems = [
    { id: 1, colClass: 'col-span-1',            aspect: '3/4',  bg: 'gp-1', label: t.galleryItem1 },
    { id: 2, colClass: 'col-span-1 md:col-span-2', aspect: '4/3',  bg: 'gp-2', label: t.galleryItem2 },
    { id: 3, colClass: 'col-span-2 md:col-span-2', aspect: '16/9', bg: 'gp-3', label: t.galleryItem3 },
    { id: 4, colClass: 'col-span-2 md:col-span-1', aspect: '3/4',  bg: 'gp-4', label: t.galleryItem4 },
    { id: 5, colClass: 'col-span-1',            aspect: '3/4',  bg: 'gp-5', label: t.galleryItem5 },
    { id: 6, colClass: 'col-span-1',            aspect: '3/4',  bg: 'gp-6', label: t.galleryItem6 },
    { id: 7, colClass: 'col-span-2 md:col-span-1', aspect: '3/4',  bg: 'gp-7', label: t.galleryItem7 },
  ];

  const { refs, visible } = useItemReveal(galleryItems.length);
  const descLines = t.galleryDesc.split('\n');

  return (
    <section
      className="reveal-section py-16 md:py-28 px-6 md:px-16 lg:px-24"
      aria-labelledby="gallery-heading"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '0 800px' } as React.CSSProperties}
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
          {galleryItems.map((item, index) => {
            const imgData = images.find((img) => img.id === item.id);
            return (
              <GalleryItem
                key={item.id}
                colClass={item.colClass}
                aspect={item.aspect}
                bgClass={item.bg}
                label={item.label}
                imageSrc={imgData?.src ?? null}
                index={index}
                isVisible={visible[index]}
                refCallback={(el) => { refs.current[index] = el; }}
              />
            );
          })}
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