export interface PortfolioImage {
  id: string;
  src: string;
  title: string;
  titleEs?: string;
  titleEn?: string;
  year: string;
  category: string;
}

export interface ContentI18nSection {
  hero?: Partial<SiteContent['hero']>;
  about?: Partial<SiteContent['about']>;
  specialties?: Partial<SiteContent['specialties']>;
  portfolio?: {
    sectionNumber?: string;
    sectionLabel?: string;
    subtitle?: string;
    images?: Array<Partial<PortfolioImage> & { id: string }>;
  };
  contact?: Partial<SiteContent['contact']>;
  footer?: Partial<SiteContent['footer']>;
}

export interface SiteContent {
  hero: {
    title: string;
    tagline: string;
    scrollText: string;
  };
  about: {
    sectionNumber: string;
    sectionLabel: string;
    heading: string;
    bio: string;
    quote: string;
    location: string;
    details: string;
    established: string;
  };
  specialties: {
    sectionNumber: string;
    sectionLabel: string;
    items: string[];
  };
  portfolio: {
    sectionNumber: string;
    sectionLabel: string;
    subtitle: string;
    images: PortfolioImage[];
  };
  contact: {
    sectionNumber: string;
    sectionLabel: string;
    heading: string;
    email: string;
    instagram: string;
    instagramUrl: string;
    location: string;
    whatsapp: string;
    whatsappText: string;
    ctaText: string;
    quote: string;
  };
  footer: {
    brand: string;
    established: string;
    rights: string;
    tagline: string;
  };
  _meta: {
    lastUpdated: string;
    version: number;
  };
  i18n?: {
    es?: ContentI18nSection;
    en?: ContentI18nSection;
  };
}

export const defaultSiteContent: SiteContent = {
  hero: {
    title: 'SERBEROINK.',
    tagline: 'permanent art. no regrets.',
    scrollText: 'Scroll to explore',
  },
  about: {
    sectionNumber: '001',
    sectionLabel: 'About',
    heading: 'The Hand Behind the Needle.',
    bio: 'Born from a city that does not sleep and a tradition that does not forget.',
    quote: 'Every line is intentional.',
    location: 'New York, NY',
    details: 'By appointment only',
    established: 'Est. 2024',
  },
  specialties: {
    sectionNumber: '002',
    sectionLabel: 'The Craft.',
    items: [
      'Serpent Work',
      'Blade & Dagger',
      'Botanical & Flora',
      'Geometry & Compass',
      'Moth & Dark Fauna',
      'Memento Mori',
    ],
  },
  portfolio: {
    sectionNumber: '003',
    sectionLabel: 'THE WORK.',
    subtitle: 'Selected pieces. All custom. All permanent.',
    images: [],
  },
  contact: {
    sectionNumber: '004',
    sectionLabel: 'BOOK A SESSION.',
    heading: 'BOOK A SESSION.',
    email: 'studio@serberoink.com',
    instagram: '@serbero_ink',
    instagramUrl: 'https://instagram.com/serbero_ink',
    location: 'New York, NY - by appointment',
    whatsapp: '1234567890',
    whatsappText: "Hi! I'd like to book a tattoo session with Serbero Ink.",
    ctaText: 'Get in Touch',
    quote: 'DMs open. Serious inquiries only.',
  },
  footer: {
    brand: 'Serbero Ink',
    established: 'Est. 2024',
    rights: 'All Rights Reserved',
    tagline: "Ink fades. Art doesn't.",
  },
  _meta: {
    lastUpdated: '2026-01-01T00:00:00.000Z',
    version: 1,
  },
  i18n: {
    es: {},
    en: {},
  },
};

function normalizeContent(input: unknown): SiteContent {
  const data = (input ?? {}) as Partial<SiteContent>;
  return {
    ...defaultSiteContent,
    ...data,
    hero: { ...defaultSiteContent.hero, ...(data.hero ?? {}) },
    about: { ...defaultSiteContent.about, ...(data.about ?? {}) },
    specialties: {
      ...defaultSiteContent.specialties,
      ...(data.specialties ?? {}),
      items: Array.isArray(data.specialties?.items)
        ? data.specialties.items.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        : defaultSiteContent.specialties.items,
    },
    portfolio: {
      ...defaultSiteContent.portfolio,
      ...(data.portfolio ?? {}),
      images: Array.isArray(data.portfolio?.images)
        ? data.portfolio.images.filter(
            (img): img is PortfolioImage =>
              !!img &&
              typeof img.id === 'string' &&
              typeof img.src === 'string' &&
              img.src.length > 0 &&
              typeof img.title === 'string' &&
              typeof img.year === 'string' &&
              typeof img.category === 'string'
          )
        : defaultSiteContent.portfolio.images,
    },
    contact: { ...defaultSiteContent.contact, ...(data.contact ?? {}) },
    footer: { ...defaultSiteContent.footer, ...(data.footer ?? {}) },
    _meta: { ...defaultSiteContent._meta, ...(data._meta ?? {}) },
    i18n: {
      es: data.i18n?.es ?? defaultSiteContent.i18n?.es,
      en: data.i18n?.en ?? defaultSiteContent.i18n?.en,
    },
  };
}

function getRawBaseUrl(): string | null {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';

  if (!owner || !repo) {
    return null;
  }

  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}`;
}

async function readLocalContent(): Promise<SiteContent> {
  const fs = await import('node:fs/promises');
  const path = await import('node:path');
  const filePath = path.join(process.cwd(), 'public', 'content', 'content.json');
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return normalizeContent(JSON.parse(raw));
  } catch {
    return defaultSiteContent;
  }
}

export async function getContent(): Promise<SiteContent> {
  const rawBase = getRawBaseUrl();

  if (rawBase) {
    const contentUrl = `${rawBase}/public/content/content.json?v=${Date.now()}`;
    try {
      const res = await fetch(contentUrl, {
        cache: 'no-store',
      });

      if (res.ok) {
        return normalizeContent(await res.json());
      }
    } catch {
      // Fall back to local file/default content below.
    }
  }

  return readLocalContent();
}
