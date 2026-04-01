'use client';

import { useEffect } from 'react';
import { trackPageview, trackSectionVisit } from '@/lib/analytics';

export default function ScrollRevealInit() {
  useEffect(() => {
    // Track page view on mount
    trackPageview('homepage');

    const elements = document.querySelectorAll('.reveal-section');
    elements?.forEach((el) => el?.classList?.add('hidden-before-reveal'));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            // Track section visit using the section's id or aria-label
            const sectionId =
              (entry.target as HTMLElement).id ||
              (entry.target as HTMLElement).getAttribute('aria-labelledby') ||
              (entry.target as HTMLElement).getAttribute('aria-label') ||
              'unknown';
            trackSectionVisit(sectionId);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -60px 0px' }
    );

    elements?.forEach((el) => observer?.observe(el));

    return () => observer?.disconnect();
  }, []);

  return null;
}