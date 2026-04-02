'use client';

import { useMemo } from 'react';
import type { SiteContent } from '@/lib/content';
import { localizeContent, useLang } from './LanguageContext';
import HeroSection from './HeroSection';
import AboutSection from './AboutSection';
import StylesSection from './StylesSection';
import GallerySection from './GallerySection';
import BookingSection from './BookingSection';
import SiteFooter from './SiteFooter';
import ScrollRevealInit from './ScrollRevealInit';
import TattooPreloader from './TattooPreloader';
import SiteNav from './SiteNav';

interface HomepageContentProps {
  content: SiteContent;
}

export default function HomepageContent({ content }: HomepageContentProps) {
  const { lang } = useLang();

  const localizedContent = useMemo(
    () => localizeContent(content, lang),
    [content, lang]
  );

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
        <GallerySection portfolio={localizedContent.portfolio} />
        <hr className="section-rule mx-8 md:mx-16" />
        <BookingSection contact={localizedContent.contact} />
        <SiteFooter footer={localizedContent.footer} />
      </main>
    </>
  );
}
