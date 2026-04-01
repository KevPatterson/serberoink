'use client';

import { useEffect, useState } from 'react';

export interface SiteContentData {
  heroLabel: string;
  heroTagline: string;
  aboutHeading: string;
  aboutBio1: string;
  aboutBio2: string;
  aboutQuote: string;
  aboutLocation: string;
  bookingEmail: string;
  bookingInstagram: string;
  bookingLocation: string;
  whatsappNumber: string;
}

export const SITE_CONTENT_STORAGE_KEY = 'serbero_site_content';
export const GALLERY_STORAGE_KEY = 'serbero_gallery_images';
export const SITE_CONTENT_UPDATED_EVENT = 'serbero_content_updated';
export const GALLERY_UPDATED_EVENT = 'serbero_gallery_updated';

export const defaultSiteContent: SiteContentData = {
  heroLabel: 'Tattoo Studio - Est. 2024',
  heroTagline: '"permanent art. no regrets."',
  aboutHeading: 'The Hand Behind the Needle.',
  aboutBio1:
    "Born from a city that doesn't sleep and a tradition that doesn't forget, Serbero has spent over a decade turning skin into story.",
  aboutBio2: 'The studio operates by appointment only. No walk-ins. No rush.',
  aboutQuote: '"Every line is intentional."',
  aboutLocation: 'New York, NY',
  bookingEmail: 'studio@serberoink.com',
  bookingInstagram: '@serbero_ink',
  bookingLocation: 'New York, NY - by appointment',
  whatsappNumber: '1234567890',
};

function parseObject<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function safeStorageRead<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  return parseObject<T>(window.localStorage.getItem(key));
}

export function getStoredSiteContent(): SiteContentData {
  const parsed = safeStorageRead<Partial<SiteContentData>>(SITE_CONTENT_STORAGE_KEY);
  return {
    ...defaultSiteContent,
    ...(parsed ?? {}),
  };
}

export function saveStoredSiteContent(content: SiteContentData): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SITE_CONTENT_STORAGE_KEY, JSON.stringify(content));
  window.dispatchEvent(new Event(SITE_CONTENT_UPDATED_EVENT));
}

export function getStoredGalleryMap(): Record<string, string> {
  return safeStorageRead<Record<string, string>>(GALLERY_STORAGE_KEY) ?? {};
}

export function saveStoredGalleryMap(map: Record<string, string>): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(map));
  window.dispatchEvent(new Event(GALLERY_UPDATED_EVENT));
}

export function useSiteContent(): SiteContentData {
  const [content, setContent] = useState<SiteContentData>(defaultSiteContent);

  useEffect(() => {
    const sync = () => {
      setContent(getStoredSiteContent());
    };

    sync();
    window.addEventListener('storage', sync);
    window.addEventListener(SITE_CONTENT_UPDATED_EVENT, sync);

    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(SITE_CONTENT_UPDATED_EVENT, sync);
    };
  }, []);

  return content;
}

export function createWhatsappUrl(number: string): string {
  const normalized = number.replace(/\D+/g, '');
  const message = encodeURIComponent("Hi! I'd like to book a tattoo session with Serbero Ink.");
  return `https://wa.me/${normalized}?text=${message}`;
}
