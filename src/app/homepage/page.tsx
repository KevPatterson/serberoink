'use client';

import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import StylesSection from './components/StylesSection';
import GallerySection from './components/GallerySection';
import BookingSection from './components/BookingSection';
import SiteFooter from './components/SiteFooter';
import ScrollRevealInit from './components/ScrollRevealInit';
import TattooPreloader from './components/TattooPreloader';
import SiteNav from './components/SiteNav';
import { LanguageProvider } from './components/LanguageContext';

export default function Homepage() {
  return (
    <LanguageProvider>
      <TattooPreloader />
      <ScrollRevealInit />
      <SiteNav />
      <main className="bg-ink-black text-parchment overflow-x-hidden">
        <HeroSection />
        <hr className="section-rule mx-8 md:mx-16" />
        <AboutSection />
        <hr className="section-rule mx-8 md:mx-16" />
        <StylesSection />
        <hr className="section-rule mx-8 md:mx-16" />
        <GallerySection />
        <hr className="section-rule mx-8 md:mx-16" />
        <BookingSection />
        <SiteFooter />
      </main>
    </LanguageProvider>
  );
}