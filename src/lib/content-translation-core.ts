import type { SiteContent } from '@/lib/content';

// Diccionario ES -> EN (el base es español, traducimos al inglés)
const exactMapEn: Record<string, string> = {
  'arte permanente sin arrepentimientos': 'permanent art. no regrets.',
  'Haz scroll para explorar': 'Scroll to explore',
  'El Arte.': 'The Craft.',
  'EL TRABAJO.': 'THE WORK.',
  'RESERVA TU SESIÓN.': 'BOOK A SESSION.',
  'RESERVA TU SESION.': 'BOOK A SESSION.',
  'Piezas seleccionadas. Todas personalizadas. Todas permanentes.': 'Selected pieces. All custom. All permanent.',
  'Solo con cita previa': 'By appointment only',
  'Cada línea es intencional.': 'Every line is intentional.',
  'Cada linea es intencional.': 'Every line is intentional.',
  'Contáctame': 'Get in Touch',
  'Contactame': 'Get in Touch',
  'DMs abiertos. Solo consultas serias.': 'DMs open. Serious inquiries only.',
  'Todos los Derechos Reservados': 'All Rights Reserved',
  'La tinta se desvanece. El arte no.': "Ink fades. Art doesn't.",
  'Hola, me gustaría reservar una sesión de tatuaje con Serbero Ink.': "Hi! I'd like to book a tattoo session with Serbero Ink.",
  'Hola, me gustaria reservar una sesion de tatuaje con Serbero Ink.': "Hi! I'd like to book a tattoo session with Serbero Ink.",
  'Sobre mí': 'About',
  'Sobre mi': 'About',
  'Contacto': 'Contact',
  'Portafolio': 'Portfolio',
  'Especialidades': 'Specialties',
  'Ubicación': 'Location',
  'Ubicacion': 'Location',
  'Correo': 'Email',
  'La Mano Detrás de la Aguja.': 'The Hand Behind the Needle.',
  'La Mano Detras de la Aguja.': 'The Hand Behind the Needle.',
  'El Arte': 'The Craft',
  'El Artista': 'The Artist',
  'Reservar Sesión': 'Book a Session',
  'Reservar Sesion': 'Book a Session',
};

const tokenMapEn: Array<[RegExp, string]> = [
  [/\bLa Habana\b/g, 'Havana, Cuba'],
  [/\bcon cita previa\b/gi, 'by appointment'],
  [/\bSolo con cita previa\b/gi, 'By appointment only'],
  [/\bBlack & Grey Realism\b/g, 'Black & Grey Realism'],
  [/\bAnime & Ilustración\b/g, 'Anime & Illustration'],
  [/\bAnime & Ilustracion\b/g, 'Anime & Illustration'],
  [/\bBlackwork & Ornamental\b/g, 'Blackwork & Ornamental'],
  [/\bNeo Traditional\b/g, 'Neo Traditional'],
  [/\bDark & Fantasy\b/g, 'Dark & Fantasy'],
  [/\bDotwork & Puntillismo\b/g, 'Dotwork & Pointillism'],
];

function translateTextToEn(input: string): string {
  if (!input) return input;
  if (exactMapEn[input]) return exactMapEn[input];

  let value = input;
  for (const [pattern, replacement] of tokenMapEn) {
    value = value.replace(pattern, replacement);
  }
  return value;
}

export function applyAutomaticI18n(content: SiteContent): SiteContent {
  return {
    ...content,
    i18n: {
      es: {
        // ES = contenido base tal cual (ya está en español)
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
            title: image.titleEs || image.title,
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
      en: {
        // EN = traducción automática ES -> EN
        hero: {
          tagline: translateTextToEn(content.hero.tagline),
          scrollText: translateTextToEn(content.hero.scrollText),
        },
        about: {
          sectionLabel: translateTextToEn(content.about.sectionLabel),
          heading: translateTextToEn(content.about.heading),
          bio: translateTextToEn(content.about.bio),
          quote: translateTextToEn(content.about.quote),
          location: translateTextToEn(content.about.location),
          details: translateTextToEn(content.about.details),
          established: content.about.established,
        },
        specialties: {
          sectionLabel: translateTextToEn(content.specialties.sectionLabel),
          items: content.specialties.items.map(translateTextToEn),
        },
        portfolio: {
          sectionLabel: translateTextToEn(content.portfolio.sectionLabel),
          subtitle: translateTextToEn(content.portfolio.subtitle),
          images: content.portfolio.images.map((image) => ({
            id: image.id,
            title: image.titleEn || translateTextToEn(image.title),
          })),
        },
        contact: {
          sectionLabel: translateTextToEn(content.contact.sectionLabel),
          heading: translateTextToEn(content.contact.heading),
          location: translateTextToEn(content.contact.location),
          whatsappText: translateTextToEn(content.contact.whatsappText),
          ctaText: translateTextToEn(content.contact.ctaText),
          quote: translateTextToEn(content.contact.quote),
        },
        footer: {
          rights: translateTextToEn(content.footer.rights),
          tagline: translateTextToEn(content.footer.tagline),
        },
      },
    },
  };
}