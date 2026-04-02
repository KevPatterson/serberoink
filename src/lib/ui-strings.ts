export const UI_STRINGS = {
  es: {
    theArtist: 'El Artista',
    scrollExplore: 'Haz scroll para explorar',
    sectionAboutLabel: 'Sobre mí',
    sectionCraftLabel: 'El Arte',
    sectionPortfolioLabel: 'Portfolio',
    sectionBookLabel: 'Reservar Sesión',
    loading: 'Cargando el arte...',
    adminLink: 'Admin',
    contactEmail: 'Correo',
    contactInstagram: 'Instagram',
    contactLocation: 'Ubicación',
    bookButton: 'Contáctame',
  },
  en: {
    theArtist: 'The Artist',
    scrollExplore: 'Scroll to explore',
    sectionAboutLabel: 'About',
    sectionCraftLabel: 'The Craft',
    sectionPortfolioLabel: 'Portfolio',
    sectionBookLabel: 'Book a Session',
    loading: 'Loading the art...',
    adminLink: 'Admin',
    contactEmail: 'Email',
    contactInstagram: 'Instagram',
    contactLocation: 'Location',
    bookButton: 'Get in Touch',
  },
} as const;

export type UIStrings = (typeof UI_STRINGS)['es'];
