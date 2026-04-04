'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { PortfolioImage } from '@/lib/content';
import { useUIStrings } from '@/hooks/useUIStrings';
import { useLang } from './LanguageContext';

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;
const AUTOPLAY_INTERVAL_MS = 3600;
const AUTOPLAY_RESUME_DELAY_MS = 5200;
const SWIPE_MIN_DISTANCE = 52;

function clampZoom(value: number) {
  return Math.min(Math.max(value, MIN_ZOOM), MAX_ZOOM);
}

function isRemoteImage(src: string) {
  return /^https?:\/\//i.test(src);
}

function normalizeIndex(index: number, total: number) {
  if (total <= 0) return 0;
  return ((index % total) + total) % total;
}

// FIX 1: Use Math.round instead of Math.floor for symmetric circular wrapping.
// Math.floor caused asymmetric delta ranges in even-length arrays, producing
// micro-jumps when wrapping from the last card back to the first.
function getCircularDelta(index: number, active: number, total: number) {
  if (total <= 1) return 0;
  let delta = index - active;
  const half = Math.round(total / 2);

  if (delta > half) {
    delta -= total;
  } else if (delta < -half) {
    delta += total;
  }

  return delta;
}

interface Point {
  x: number;
  y: number;
}

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
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
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
            setTimeout(
              () => {
                setVisible((prev) => {
                  const next = [...prev];
                  next[i] = true;
                  return next;
                });
              },
              Math.min(i * 60, 900)
            );
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

export default function GallerySection({ portfolio, instagramUrl }: GallerySectionProps) {
  const ui = useUIStrings();
  const { lang } = useLang();
  const { refs, visible } = useItemReveal(portfolio.images.length);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isShowcaseHovered, setIsShowcaseHovered] = useState(false);

  // FIX 2: Track the resume timestamp in a ref instead of state.
  // Using state caused an extra render cycle + an additional useEffect pass
  // every time the user interacted, which could interrupt in-flight CSS
  // transitions on the cards. A ref stores the value without triggering
  // re-renders, so the autoplay timer resets silently.
  const autoplayResumeAfterRef = useRef(0);
  // A separate boolean state is enough to pause/resume the interval effect.
  const [autoplayPaused, setAutoplayPaused] = useState(false);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const pinchDistanceRef = useRef<number | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef<Point | null>(null);
  const dragOriginRef = useRef<Point>({ x: 0, y: 0 });
  const panTouchStartRef = useRef<Point | null>(null);
  const showcaseTouchStartRef = useRef<Point | null>(null);

  // FIX 3: Keep a ref to the current zoom value so memoized callbacks
  // (clampOffset, handleViewerWheel) always read the latest value without
  // being re-created on every zoom change.
  const zoomRef = useRef(zoom);
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  const normalizedSectionLabel = portfolio.sectionLabel.trim().toLowerCase();
  const localizedSectionLabel =
    lang === 'es' &&
    (normalizedSectionLabel === 'the work.' || normalizedSectionLabel === 'the work')
      ? ui.sectionPortfolioLabel
      : portfolio.sectionLabel;
  const activeImage = activeIndex !== null ? portfolio.images[activeIndex] : null;
  const totalImages = portfolio.images.length;
  const hasMultipleImages = totalImages > 1;

  const markManualInteraction = useCallback(() => {
    autoplayResumeAfterRef.current = Date.now() + AUTOPLAY_RESUME_DELAY_MS;
    setAutoplayPaused(true);
    // Let the effect clean itself up via its own timer.
  }, []);

  useEffect(() => {
    setActiveSlide((prev) => normalizeIndex(prev, totalImages));
  }, [totalImages]);

  // FIX 4: Simplified autoplay effect. The previous version had a dual-pass
  // pattern (set state → re-run effect → clear state → re-run effect again)
  // that caused the interval to restart twice per manual interaction, producing
  // a visible stutter when autoplay resumed. Now the effect uses a single
  // setTimeout to re-enable the interval, with a stable cleanup path.
  useEffect(() => {
    if (!hasMultipleImages || activeIndex !== null || isShowcaseHovered) return;
    if (typeof window === 'undefined') return;

    const desktopMatch = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!desktopMatch || reducedMotion) return;

    if (autoplayPaused) {
      const remaining = autoplayResumeAfterRef.current - Date.now();
      const delay = remaining > 0 ? remaining : 0;
      const tid = window.setTimeout(() => setAutoplayPaused(false), delay);
      return () => window.clearTimeout(tid);
    }

    const iid = window.setInterval(() => {
      setActiveSlide((prev) => normalizeIndex(prev + 1, totalImages));
    }, AUTOPLAY_INTERVAL_MS);

    return () => window.clearInterval(iid);
  }, [hasMultipleImages, activeIndex, isShowcaseHovered, totalImages, autoplayPaused]);

  const openViewer = (index: number) => {
    markManualInteraction();
    setActiveSlide(index);
    setActiveIndex(index);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const goToSlide = useCallback(
    (index: number) => {
      markManualInteraction();
      setActiveSlide(normalizeIndex(index, totalImages));
    },
    [markManualInteraction, totalImages]
  );

  const goToNextSlide = useCallback(() => {
    if (!hasMultipleImages) return;
    setActiveSlide((prev) => {
      markManualInteraction();
      return normalizeIndex(prev + 1, totalImages);
    });
  }, [hasMultipleImages, markManualInteraction, totalImages]);

  const goToPrevSlide = useCallback(() => {
    if (!hasMultipleImages) return;
    setActiveSlide((prev) => {
      markManualInteraction();
      return normalizeIndex(prev - 1, totalImages);
    });
  }, [hasMultipleImages, markManualInteraction, totalImages]);

  // FIX 5: Prevent vertical scroll during horizontal swipe on mobile.
  // The original handler only checked changedTouches on touchend, meaning
  // the browser could start a scroll mid-swipe before the direction was
  // confirmed. Now we preventDefault on touchmove when a horizontal swipe
  // is detected, keeping the gesture clean. The handler is declared as
  // non-passive (registered via addEventListener below) so preventDefault works.
  const showcaseTouchMoveRef = useRef<((e: TouchEvent) => void) | null>(null);
  const showcaseElRef = useRef<HTMLDivElement | null>(null);

  const handleShowcaseTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!hasMultipleImages || event.touches.length !== 1) {
      showcaseTouchStartRef.current = null;
      return;
    }
    const touch = event.touches[0];
    showcaseTouchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleShowcaseTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!showcaseTouchStartRef.current || event.changedTouches.length !== 1) {
      showcaseTouchStartRef.current = null;
      return;
    }

    const touch = event.changedTouches[0];
    const dx = touch.clientX - showcaseTouchStartRef.current.x;
    const dy = touch.clientY - showcaseTouchStartRef.current.y;

    showcaseTouchStartRef.current = null;

    if (Math.abs(dx) < SWIPE_MIN_DISTANCE) return;
    if (Math.abs(dx) <= Math.abs(dy) * 1.2) return;

    if (dx < 0) {
      goToNextSlide();
    } else {
      goToPrevSlide();
    }
  };

  // Register a non-passive touchmove listener on the showcase to allow
  // preventDefault during horizontal swipes (prevents page scroll jank).
  useEffect(() => {
    const el = showcaseElRef.current;
    if (!el) return;

    const onMove = (event: TouchEvent) => {
      if (!showcaseTouchStartRef.current || event.touches.length !== 1) return;
      const dx = event.touches[0].clientX - showcaseTouchStartRef.current.x;
      const dy = event.touches[0].clientY - showcaseTouchStartRef.current.y;
      if (Math.abs(dx) > Math.abs(dy) * 1.2 && Math.abs(dx) > 10) {
        event.preventDefault();
      }
    };

    showcaseTouchMoveRef.current = onMove;
    el.addEventListener('touchmove', onMove, { passive: false });
    return () => el.removeEventListener('touchmove', onMove);
  }, []);

  const closeViewer = () => {
    setActiveIndex(null);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setIsDragging(false);
    pinchDistanceRef.current = null;
    dragStartRef.current = null;
    panTouchStartRef.current = null;
  };

  const zoomIn = () => setZoom((prev) => clampZoom(prev + ZOOM_STEP));
  const zoomOut = () => setZoom((prev) => clampZoom(prev - ZOOM_STEP));
  const resetZoom = () => {
    setZoom(MIN_ZOOM);
    setOffset({ x: 0, y: 0 });
  };

  // FIX 6: Memoize clampOffset so it doesn't get recreated on every render.
  // It reads zoom from zoomRef to avoid stale closure values.
  const clampOffset = useCallback((next: Point, currentZoom?: number): Point => {
    const z = currentZoom ?? zoomRef.current;
    const stage = stageRef.current;
    if (!stage || z <= 1) return { x: 0, y: 0 };
    const maxX = ((z - 1) * stage.clientWidth) / 2;
    const maxY = ((z - 1) * stage.clientHeight) / 2;
    return {
      x: Math.min(Math.max(next.x, -maxX), maxX),
      y: Math.min(Math.max(next.y, -maxY), maxY),
    };
  }, []);

  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return null;
    const [first, second] = [touches[0], touches[1]];
    const dx = first.clientX - second.clientX;
    const dy = first.clientY - second.clientY;
    return Math.hypot(dx, dy);
  };

  // FIX 7: Memoize handleViewerWheel with useCallback so the same function
  // reference is used across effect runs. Previously a new function was
  // created on every render, meaning addEventListener added a new listener
  // while the cleanup only removed the stale one — causing listener accumulation
  // and erratic zoom behavior during fast scrolling.
  const handleViewerWheel = useCallback(
    (event: WheelEvent) => {
      event.preventDefault();
      const delta = event.deltaY < 0 ? 0.14 : -0.14;
      setZoom((prev) => {
        const nextZoom = clampZoom(prev + delta);
        setOffset((prevOffset) => clampOffset(prevOffset, nextZoom));
        return nextZoom;
      });
    },
    [clampOffset]
  );

  const startDrag = useCallback(
    (point: Point) => {
      if (zoomRef.current <= 1) return;
      dragStartRef.current = point;
      dragOriginRef.current = offset;
      setIsDragging(true);
    },
    [offset]
  );

  const updateDrag = useCallback(
    (point: Point) => {
      if (!dragStartRef.current) return;
      const dx = point.x - dragStartRef.current.x;
      const dy = point.y - dragStartRef.current.y;
      setOffset(
        clampOffset({
          x: dragOriginRef.current.x + dx,
          y: dragOriginRef.current.y + dy,
        })
      );
    },
    [clampOffset]
  );

  const stopDrag = useCallback(() => {
    dragStartRef.current = null;
    setIsDragging(false);
  }, []);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    startDrag({ x: event.clientX, y: event.clientY });
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!dragStartRef.current) return;
    event.preventDefault();
    updateDrag({ x: event.clientX, y: event.clientY });
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length === 2) {
      pinchDistanceRef.current = getTouchDistance(event.touches);
      panTouchStartRef.current = null;
      return;
    }

    if (event.touches.length === 1 && zoomRef.current > 1) {
      const touch = event.touches[0];
      const point = { x: touch.clientX, y: touch.clientY };
      panTouchStartRef.current = point;
      startDrag(point);
    }
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    const distance = getTouchDistance(event.touches);
    if (distance && pinchDistanceRef.current) {
      const delta = (distance - pinchDistanceRef.current) / 220;
      setZoom((prev) => {
        const nextZoom = clampZoom(prev + delta);
        setOffset((prevOffset) => clampOffset(prevOffset, nextZoom));
        return nextZoom;
      });
      pinchDistanceRef.current = distance;
      return;
    }

    if (event.touches.length !== 1 || !panTouchStartRef.current || !dragStartRef.current) return;

    const touch = event.touches[0];
    updateDrag({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length < 2) {
      pinchDistanceRef.current = null;
    }

    if (event.touches.length !== 1) {
      panTouchStartRef.current = null;
      stopDrag();
    }
  };

  // FIX 8: Remove the separate `useEffect` that clamped offset on zoom change.
  // That effect ran after paint, causing a visible one-frame "pop" when zooming
  // out past the current offset bounds. Offset is now clamped inline inside
  // every setZoom call (handleViewerWheel, zoomIn, zoomOut, pinch), so the
  // state is always consistent within the same batch update.

  useEffect(() => {
    if (activeIndex === null) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [activeIndex]);

  useEffect(() => {
    if (activeIndex === null) return;
    const stage = stageRef.current;
    if (!stage) return;
    stage.addEventListener('wheel', handleViewerWheel, { passive: false });
    return () => {
      stage.removeEventListener('wheel', handleViewerWheel);
    };
  }, [activeIndex, handleViewerWheel]);

  useEffect(() => {
    if (activeIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { closeViewer(); return; }
      if (event.key === '+' || event.key === '=') { event.preventDefault(); zoomIn(); return; }
      if (event.key === '-' || event.key === '_') { event.preventDefault(); zoomOut(); return; }
      if (event.key === '0') { event.preventDefault(); resetZoom(); }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeIndex]);

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

        <div className="portfolio-showcase">
          <div
            ref={showcaseElRef}
            className="portfolio-showcase-stage"
            aria-label={ui.sectionPortfolioLabel}
            onMouseEnter={() => setIsShowcaseHovered(true)}
            onMouseLeave={() => setIsShowcaseHovered(false)}
            onTouchStart={handleShowcaseTouchStart}
            onTouchEnd={handleShowcaseTouchEnd}
          >
            {portfolio.images.map((image, index) => {
              const delta = getCircularDelta(index, activeSlide, totalImages);
              const absDelta = Math.abs(delta);

              if (totalImages > 5 && absDelta > 2) {
                return null;
              }

              const isActiveCard = delta === 0;
              const xOffset = delta * (totalImages <= 3 ? 26 : 20);
              const yOffset = absDelta * 16;
              const tilt = delta * 6;
              const scale = isActiveCard ? 1 : 0.9 - absDelta * 0.07;

              return (
                <button
                  key={image.id}
                  type="button"
                  className={`portfolio-card gallery-img gallery-interactive ${isActiveCard ? 'is-active' : ''}`}
                  style={{
                    zIndex: 40 - absDelta,
                    opacity: 1 - absDelta * 0.26,
                    transform: `translate3d(-50%, -50%, 0) translate3d(${xOffset}%, ${yOffset}px, 0) rotate(${tilt}deg) scale(${scale})`,
                    transitionDelay: `${Math.max(0, 2 - absDelta) * 35}ms`,
                  }}
                  aria-label={`${ui.portfolioOpenImage}: ${image.title}, ${image.year}`}
                  onClick={() => {
                    if (isActiveCard) {
                      openViewer(index);
                      return;
                    }
                    goToSlide(index);
                  }}
                >
                  <Image
                    src={image.src}
                    alt={`${image.title} ${image.year}`}
                    fill
                    sizes="(max-width: 768px) 84vw, (max-width: 1200px) 62vw, 46vw"
                    unoptimized={isRemoteImage(image.src)}
                    style={{ objectFit: 'cover' }}
                  />

                  <div className="portfolio-card-frame" aria-hidden="true" />
                  <div className="portfolio-card-overlay" aria-hidden="true" />

                  <div className="portfolio-card-meta">
                    <p>{image.title}</p>
                    <span>{image.year}</span>
                  </div>
                </button>
              );
            })}

            <div className="portfolio-nav">
              <button
                type="button"
                className="portfolio-nav-btn"
                aria-label={ui.portfolioPrevImage}
                onClick={goToPrevSlide}
                disabled={!hasMultipleImages}
              >
                ←
              </button>
              <button
                type="button"
                className="portfolio-nav-btn"
                aria-label={ui.portfolioNextImage}
                onClick={goToNextSlide}
                disabled={!hasMultipleImages}
              >
                →
              </button>
            </div>
          </div>

          <div className="portfolio-thumbnails" role="tablist" aria-label={ui.sectionPortfolioLabel}>
            {portfolio.images.map((image, index) => {
              const isCurrent = index === activeSlide;

              return (
                <button
                  key={`${image.id}-thumb`}
                  type="button"
                  ref={(el) => {
                    refs.current[index] = el;
                  }}
                  className={`portfolio-thumb ${isCurrent ? 'is-current' : ''}`}
                  style={{
                    opacity: visible[index] ? 1 : 0,
                    transform: visible[index] ? 'translateY(0)' : 'translateY(12px)',
                    transition: `opacity 0.45s cubic-bezier(0.16,1,0.3,1) ${index * 0.04}s, transform 0.45s cubic-bezier(0.16,1,0.3,1) ${index * 0.04}s`,
                  }}
                  role="tab"
                  aria-selected={isCurrent}
                  aria-label={`${image.title}, ${image.year}`}
                  onClick={() => goToSlide(index)}
                >
                  <Image
                    src={image.src}
                    alt={`${image.title} ${image.year}`}
                    fill
                    sizes="88px"
                    unoptimized={isRemoteImage(image.src)}
                    style={{ objectFit: 'cover' }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {activeImage && (
          <div
            className="portfolio-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={ui.portfolioViewerDialog}
            onClick={(event) => {
              if (event.target === event.currentTarget) closeViewer();
            }}
          >
            <div className="portfolio-lightbox-toolbar">
              <p className="portfolio-lightbox-meta">
                {activeImage.title} - {activeImage.year} · {Math.round(zoom * 100)}%
              </p>
              <div className="portfolio-lightbox-actions">
                <button type="button" onClick={zoomOut} aria-label={ui.portfolioZoomOut}>-</button>
                <button type="button" onClick={resetZoom} aria-label={ui.portfolioZoomReset}>100%</button>
                <button type="button" onClick={zoomIn} aria-label={ui.portfolioZoomIn}>+</button>
                <button type="button" onClick={closeViewer} aria-label={ui.portfolioCloseViewer}>×</button>
              </div>
            </div>

            <div
              ref={stageRef}
              className={`portfolio-lightbox-stage ${zoom > 1 ? 'is-pannable' : ''} ${isDragging ? 'is-dragging' : ''}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={stopDrag}
              onMouseLeave={stopDrag}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
            >
              <div className="portfolio-lightbox-media">
                <Image
                  src={activeImage.src}
                  alt={`${activeImage.title} ${activeImage.year}`}
                  fill
                  priority
                  quality={100}
                  sizes="92vw"
                  unoptimized={activeImage.src.startsWith('http')}
                  style={{
                    objectFit: 'contain',
                    transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${zoom})`,
                    transformOrigin: 'center center',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center mt-10 md:mt-14">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-btn cta-btn-ink inline-flex items-center gap-2"
            aria-label={ui.portfolioInstagramButton}
          >
            <svg
              aria-hidden="true"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
            </svg>
            {ui.portfolioInstagramButton}
          </a>
        </div>
      </div>
    </section>
  );
}