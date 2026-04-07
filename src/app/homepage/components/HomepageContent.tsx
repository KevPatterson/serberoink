'use client';

import { useCallback, useMemo, useState } from 'react';
import type { SiteContent } from '@/lib/content';
import { localizeContent, useLang } from './LanguageContext';
import { useContentPolling } from '@/hooks/useContentPolling';
import HeroSection from './HeroSection';
import AboutSection from './AboutSection';
import StylesSection from './StylesSection';
import GallerySection from './GallerySection';
import BookingSection from './BookingSection';
import SiteFooter from './SiteFooter';
import ScrollRevealInit from './ScrollRevealInit';
import TattooPreloader from './TattooPreloader';
import SiteNav from './SiteNav';
import TattooPlacementMap from '@/components/TattooPlacementMap';
import InkCalculator from './InkCalculator';

interface HomepageContentProps {
  initialContent: SiteContent;
  initialVersion: number;
}

function normalizePlacementFromZone(zone: string): string {
  if (zone.includes('head')) return 'head';
  if (zone.includes('neck')) return 'neck';
  if (zone.includes('chest')) return 'chest';
  if (zone.includes('ribs')) return 'ribs';
  if (zone.includes('stomach')) return 'stomach';
  if (zone.includes('shoulder')) return 'shoulder';
  if (zone.includes('upper-back')) return 'upper-back';
  if (zone.includes('lower-back')) return 'lower-back';
  if (zone.includes('upper-arm') || zone === 'left-arm' || zone === 'right-arm') return 'arm';
  if (zone.includes('forearm')) return 'forearm';
  if (zone.includes('hand')) return 'hand';
  if (zone.includes('thigh')) return 'thigh';
  if (zone.includes('knee')) return 'knee';
  if (zone.includes('calf') || zone.includes('shin')) return 'calf';
  if (zone.includes('ankle') || zone.includes('foot') || zone.includes('heel')) return 'ankle';
  return zone;
}

export default function HomepageContent({
  initialContent,
  initialVersion,
}: HomepageContentProps) {
  const { lang } = useLang();
  const [selectedPlacement, setSelectedPlacement] = useState<string | null>(null);
  const content = useContentPolling(initialContent, initialVersion);

  const localizedContent = useMemo(
    () => localizeContent(content, lang),
    [content, lang]
  );

  const handlePlacementZoneClick = useCallback((zone: string) => {
    const nextPlacement = normalizePlacementFromZone(zone);
    setSelectedPlacement((current) =>
      current === nextPlacement ? null : nextPlacement
    );
    const gallery = document.getElementById('gallery-section');
    gallery?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const clearPlacementFilter = useCallback(() => {
    setSelectedPlacement(null);
  }, []);

  return (
    <>
      <TattooPreloader />
      <ScrollRevealInit />
      <SiteNav />
      <main className="bg-ink-black text-parchment overflow-x-hidden">
        <HeroSection hero={localizedContent.hero} />
        <hr className="section-rule mx-8 md:mx-16" />
        <AboutSection about={localizedContent.about} />
        <hr className="section-rule mx-8 md:mx-16" />
        <StylesSection specialties={localizedContent.specialties} />
        <hr className="section-rule mx-8 md:mx-16" />
        <GallerySection
          portfolio={localizedContent.portfolio}
          instagramUrl={localizedContent.contact.instagramUrl}
          selectedPlacement={selectedPlacement}
          onClearPlacement={clearPlacementFilter}
          lang={lang}
        />
        <hr className="section-rule mx-8 md:mx-16" />
        <TattooPlacementMap
          className="reveal-section"
          lang={lang}
          onZoneClick={handlePlacementZoneClick}
        />
        <hr className="section-rule mx-8 md:mx-16" />
        <InkCalculator
          pricePerHour={localizedContent.contact.pricePerHour}
          whatsappNumber={localizedContent.contact.whatsapp}
          whatsappBaseText={localizedContent.contact.whatsappText}
        />
        <hr className="section-rule mx-8 md:mx-16" />
        <BookingSection contact={localizedContent.contact} />
        <SiteFooter footer={localizedContent.footer} />
      </main>
    </>
  );
}
