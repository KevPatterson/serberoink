import type { SiteContent } from '@/lib/content';

const exactMapEs: Record<string, string> = {
  'Scroll to explore': 'Desplazate para explorar',
  'The Craft.': 'El Arte.',
  'THE WORK.': 'EL TRABAJO.',
  'BOOK A SESSION.': 'RESERVA TU SESION.',
  'Selected pieces. All custom. All permanent.': 'Piezas seleccionadas. Todas personalizadas. Todas permanentes.',
  'By appointment only': 'Solo con cita previa',
  'Every line is intentional.': 'Cada linea es intencional.',
  'Get in Touch': 'Contactame',
  'DMs open. Serious inquiries only.': 'DMs abiertos. Solo consultas serias.',
  'All Rights Reserved': 'Todos los Derechos Reservados',
  "Ink fades. Art doesn't.": 'La tinta se desvanece. El arte no.',
  "Hi! I'd like to book a tattoo session with Serbero Ink.": 'Hola, me gustaria reservar una sesion de tatuaje con Serbero Ink.',
  'About': 'Sobre mi',
  'Contact': 'Contacto',
  'Portfolio': 'Portafolio',
  'Specialties': 'Especialidades',
  'Location': 'Ubicacion',
  'Email': 'Correo',
};

const tokenMapEs: Array<[RegExp, string]> = [
  [/\bNew York\b/g, 'Nueva York'],
  [/\bby appointment\b/gi, 'con cita previa'],
  [/\bBook\b/g, 'Reserva'],
  [/\bSession\b/g, 'Sesion'],
  [/\bThe Hand Behind the Needle\./g, 'La Mano Detras de la Aguja.'],
  [/\bSerpent Study\b/g, 'Estudio de Serpiente'],
  [/\bBotanical Sleeve Detail\b/g, 'Detalle de Manga Botanica'],
  [/\bGeometric Chest Piece\b/g, 'Pieza Geometrica de Pecho'],
  [/\bMoth & Dagger\b/g, 'Polilla y Daga'],
  [/\bRose Flash\b/g, 'Flash de Rosa'],
  [/\bSkull Study\b/g, 'Estudio de Calavera'],
  [/\bCompass & Stars\b/g, 'Compas y Estrellas'],
  [/\bSerpent Work\b/g, 'Trabajo de Serpientes'],
  [/\bBlade & Dagger\b/g, 'Cuchillas y Dagas'],
  [/\bBotanical & Flora\b/g, 'Botanica y Flora'],
  [/\bGeometry & Compass\b/g, 'Geometria y Compas'],
  [/\bMoth & Dark Fauna\b/g, 'Polillas y Fauna Oscura'],
];

function translateTextToEs(input: string): string {
  if (!input) return input;
  if (exactMapEs[input]) return exactMapEs[input];

  let value = input;
  for (const [pattern, replacement] of tokenMapEs) {
    value = value.replace(pattern, replacement);
  }
  return value;
}

export function applyAutomaticI18n(content: SiteContent): SiteContent {
  const esImages = content.portfolio.images.map((image) => ({
    id: image.id,
    title: image.titleEs || translateTextToEs(image.title),
  }));

  return {
    ...content,
    i18n: {
      es: {
        hero: {
          tagline: translateTextToEs(content.hero.tagline),
          scrollText: translateTextToEs(content.hero.scrollText),
        },
        about: {
          sectionLabel: translateTextToEs(content.about.sectionLabel),
          heading: translateTextToEs(content.about.heading),
          bio: translateTextToEs(content.about.bio),
          quote: translateTextToEs(content.about.quote),
          location: translateTextToEs(content.about.location),
          details: translateTextToEs(content.about.details),
          established: translateTextToEs(content.about.established),
        },
        specialties: {
          sectionLabel: translateTextToEs(content.specialties.sectionLabel),
          items: content.specialties.items.map(translateTextToEs),
        },
        portfolio: {
          sectionLabel: translateTextToEs(content.portfolio.sectionLabel),
          subtitle: translateTextToEs(content.portfolio.subtitle),
          images: esImages,
        },
        contact: {
          sectionLabel: translateTextToEs(content.contact.sectionLabel),
          heading: translateTextToEs(content.contact.heading),
          location: translateTextToEs(content.contact.location),
          whatsappText: translateTextToEs(content.contact.whatsappText),
          ctaText: translateTextToEs(content.contact.ctaText),
          quote: translateTextToEs(content.contact.quote),
        },
        footer: {
          rights: translateTextToEs(content.footer.rights),
          tagline: translateTextToEs(content.footer.tagline),
        },
      },
      en: {
        hero: {
          tagline: content.hero.tagline,
          scrollText: content.hero.scrollText,
        },
        about: {
          sectionLabel: content.about.sectionLabel,
          heading: content.about.heading,
          bio: content.about.bio,
          quote: content.about.quote,
          location: content.about.location,
          details: content.about.details,
          established: content.about.established,
        },
        specialties: {
          sectionLabel: content.specialties.sectionLabel,
          items: content.specialties.items,
        },
        portfolio: {
          sectionLabel: content.portfolio.sectionLabel,
          subtitle: content.portfolio.subtitle,
          images: content.portfolio.images.map((image) => ({
            id: image.id,
            title: image.titleEn || image.title,
          })),
        },
        contact: {
          sectionLabel: content.contact.sectionLabel,
          heading: content.contact.heading,
          location: content.contact.location,
          whatsappText: content.contact.whatsappText,
          ctaText: content.contact.ctaText,
          quote: content.contact.quote,
        },
        footer: {
          rights: content.footer.rights,
          tagline: content.footer.tagline,
        },
      },
    },
  };
}