'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type Lang = 'en' | 'es';

interface Translations {
  // Nav
  adminPanel: string;
  // Hero
  heroLabel: string;
  heroTagline: string;
  heroScroll: string;
  heroArtist: string;
  // About
  aboutLabel: string;
  aboutHeading: string;
  aboutBio1: string;
  aboutBio2: string;
  aboutQuote: string;
  aboutLocation: string;
  aboutAppointment: string;
  aboutEst: string;
  // Styles
  stylesLabel: string;
  stylesHeading: string;
  specialty1: string;
  specialty2: string;
  specialty3: string;
  specialty4: string;
  specialty5: string;
  specialty6: string;
  // Gallery
  galleryLabel: string;
  galleryNote: string;
  galleryDesc: string;
  galleryItem1: string;
  galleryItem2: string;
  galleryItem3: string;
  galleryItem4: string;
  galleryItem5: string;
  galleryItem6: string;
  galleryItem7: string;
  // Booking
  bookingLabel: string;
  bookingHeading: string;
  bookingEmail: string;
  bookingInstagram: string;
  bookingLocation: string;
  bookingLocationVal: string;
  bookingCTA: string;
  bookingNote: string;
  // Footer
  footerCopy: string;
  footerTagline: string;
}

const en: Translations = {
  adminPanel: 'Admin',
  heroLabel: 'Tattoo Studio — Est. 2024',
  heroTagline: '"permanent art. no regrets."',
  heroScroll: 'Scroll to explore',
  heroArtist: 'The Artist',
  aboutLabel: '001 — About',
  aboutHeading: 'The Hand\nBehind the Needle.',
  aboutBio1: 'orn from a city that doesn\'t sleep and a tradition that doesn\'t forget, Serbero has spent over a decade turning skin into story. Trained in the classical flash tradition, then unlearned — rebuilt from scratch with obsessive attention to line weight and negative space.',
  aboutBio2: 'The studio operates by appointment only. No walk-ins. No rush. Each piece is drawn from conversation, from the weight of what you carry, from what you want to carry for the rest of your life.',
  aboutQuote: '"Every line is intentional."',
  aboutLocation: 'Based in — New York, NY',
  aboutAppointment: 'By appointment only',
  aboutEst: 'Est. 2024',
  stylesLabel: '002 — Specialties',
  stylesHeading: 'The Craft.',
  specialty1: 'Serpent Work',
  specialty2: 'Blade & Dagger',
  specialty3: 'Botanical & Flora',
  specialty4: 'Geometry & Compass',
  specialty5: 'Moth & Dark Fauna',
  specialty6: 'Memento Mori',
  galleryLabel: '003 — Portfolio',
  galleryNote: 'All images replaced by client — placeholders shown',
  galleryDesc: 'Selected pieces.\nAll custom.\nAll permanent.',
  galleryItem1: 'Serpent Study, 2025',
  galleryItem2: 'Botanical Sleeve Detail, 2025',
  galleryItem3: 'Geometric Chest Piece, 2024',
  galleryItem4: 'Moth & Dagger, 2024',
  galleryItem5: 'Rose Flash, 2025',
  galleryItem6: 'Skull Study, 2025',
  galleryItem7: 'Compass & Stars, 2024',
  bookingLabel: '004 — Book a Session',
  bookingHeading: 'BOOK A\nSESSION.',
  bookingEmail: 'Email —',
  bookingInstagram: 'Instagram —',
  bookingLocation: 'Location —',
  bookingLocationVal: 'New York, NY — by appointment',
  bookingCTA: 'Get in Touch',
  bookingNote: '"DMs open. Serious inquiries only."',
  footerCopy: '© Serbero Ink — Est. 2024 — All Rights Reserved',
  footerTagline: 'Ink fades. Art doesn\'t.',
};

const es: Translations = {
  adminPanel: 'Admin',
  heroLabel: 'Estudio de Tatuajes — Est. 2024',
  heroTagline: '"arte permanente. sin arrepentimientos."',
  heroScroll: 'Desplázate para explorar',
  heroArtist: 'El Artista',
  aboutLabel: '001 — Sobre mí',
  aboutHeading: 'La Mano\nDetrás de la Aguja.',
  aboutBio1: 'acido de una ciudad que no duerme y una tradición que no olvida, Serbero lleva más de una década convirtiendo la piel en historia. Formado en la tradición clásica del flash, luego desaprendido — reconstruido desde cero con atención obsesiva al grosor de línea y el espacio negativo.',
  aboutBio2: 'El estudio opera solo con cita previa. Sin visitas sin cita. Sin prisas. Cada pieza nace de una conversación, del peso de lo que cargas, de lo que quieres cargar el resto de tu vida.',
  aboutQuote: '"Cada línea es intencional."',
  aboutLocation: 'Ubicado en — Nueva York, NY',
  aboutAppointment: 'Solo con cita previa',
  aboutEst: 'Est. 2024',
  stylesLabel: '002 — Especialidades',
  stylesHeading: 'El Arte.',
  specialty1: 'Trabajo de Serpientes',
  specialty2: 'Cuchillas y Dagas',
  specialty3: 'Botánica y Flora',
  specialty4: 'Geometría y Compás',
  specialty5: 'Polillas y Fauna Oscura',
  specialty6: 'Memento Mori',
  galleryLabel: '003 — Portafolio',
  galleryNote: 'Imágenes reemplazadas por el cliente — se muestran marcadores',
  galleryDesc: 'Piezas seleccionadas.\nTodas personalizadas.\nTodas permanentes.',
  galleryItem1: 'Estudio de Serpiente, 2025',
  galleryItem2: 'Detalle de Manga Botánica, 2025',
  galleryItem3: 'Pieza Geométrica de Pecho, 2024',
  galleryItem4: 'Polilla y Daga, 2024',
  galleryItem5: 'Flash de Rosa, 2025',
  galleryItem6: 'Estudio de Calavera, 2025',
  galleryItem7: 'Compás y Estrellas, 2024',
  bookingLabel: '004 — Reservar Sesión',
  bookingHeading: 'RESERVA TU\nSESIÓN.',
  bookingEmail: 'Email —',
  bookingInstagram: 'Instagram —',
  bookingLocation: 'Ubicación —',
  bookingLocationVal: 'Nueva York, NY — con cita previa',
  bookingCTA: 'Contáctame',
  bookingNote: '"DMs abiertos. Solo consultas serias."',
  footerCopy: '© Serbero Ink — Est. 2024 — Todos los Derechos Reservados',
  footerTagline: 'La tinta se desvanece. El arte no.',
};

interface LanguageContextType {
  lang: Lang;
  t: Translations;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  t: en,
  toggleLang: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');
  const toggleLang = () => setLang((l) => (l === 'en' ? 'es' : 'en'));
  const t = lang === 'en' ? en : es;
  return (
    <LanguageContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
