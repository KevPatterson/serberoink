import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import StylesSection from './components/StylesSection';
import GallerySection from './components/GallerySection';
import BookingSection from './components/BookingSection';
import SiteFooter from './components/SiteFooter';
import ScrollRevealInit from './components/ScrollRevealInit';
import TattooPreloader from './components/TattooPreloader';
import SiteNav from './components/SiteNav';
import { getContent } from '@/lib/content';

export default async function Homepage() {
  const content = await getContent();

  return (
    <>
      <TattooPreloader />
      <ScrollRevealInit />
      <SiteNav />
      <main className="bg-ink-black text-parchment overflow-x-hidden">
        <HeroSection hero={content.hero} />
        <hr className="section-rule mx-8 md:mx-16" />
        <AboutSection about={content.about} />
        <hr className="section-rule mx-8 md:mx-16" />
        <StylesSection specialties={content.specialties} />
        <hr className="section-rule mx-8 md:mx-16" />
        <GallerySection portfolio={content.portfolio} />
        <hr className="section-rule mx-8 md:mx-16" />
        <BookingSection contact={content.contact} />
        <SiteFooter footer={content.footer} />
      </main>
    </>
  );
}