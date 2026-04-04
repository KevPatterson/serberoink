'use client';

import { useMemo } from 'react';
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

interface HomepageContentProps {
  initialContent: SiteContent;
  initialVersion: number;
}

export default function HomepageContent({
  initialContent,
  initialVersion,
}: HomepageContentProps) {
  const { lang } = useLang();
  const content = useContentPolling(initialContent, initialVersion);

  const localizedContent = useMemo(
    () => localizeContent(content, lang),
    [content, lang]
  );

  const placementTitle = lang === 'es' ? 'Mapa de Ubicacion' : 'Placement Map';
  const placementHeading = lang === 'es' ? 'Ubicacion del Tatuaje' : 'Tattoo Placement';
  const placementSubtitle =
    lang === 'es'
      ? 'Explora zonas del cuerpo para inspirarte y filtrar referencias por ubicacion.'
      : 'Explore body zones to get inspired and filter references by placement.';

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
        />
        <hr className="section-rule mx-8 md:mx-16" />
        <section className="reveal-section py-16 md:py-24 px-6 md:px-16 lg:px-24">
          <div className="mx-auto w-full max-w-5xl">
            <div className="mb-10 text-center">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.34em] text-muted-parchment">
                004 - {placementTitle}
              </p>
              <h2 className="font-serif text-4xl italic text-faded-gold md:text-5xl">{placementHeading}</h2>
              <p className="mx-auto mt-4 max-w-2xl font-mono text-xs uppercase tracking-[0.16em] text-muted-parchment">
                {placementSubtitle}
              </p>
            </div>

            <TattooPlacementMap className="mx-auto" lang={lang} />
          </div>
        </section>
        <hr className="section-rule mx-8 md:mx-16" />
        <BookingSection contact={localizedContent.contact} />
        <SiteFooter footer={localizedContent.footer} />
      </main>
    </>
  );
}
