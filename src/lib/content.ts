export interface PortfolioImage {
  id: string;
  src: string;
  title: string;
  year: string;
  category: string;
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
}

function getRawBaseUrl(): string | null {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH;

  if (!owner || !repo || !branch) {
    return null;
  }

  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}`;
}

export async function getContent(): Promise<SiteContent> {
  const rawBase = getRawBaseUrl();
  const contentUrl = rawBase
    ? `${rawBase}/public/content/content.json`
    : 'http://localhost:4028/content/content.json';

  const res = await fetch(contentUrl, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch content');
  }

  return (await res.json()) as SiteContent;
}
