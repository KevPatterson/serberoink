import 'server-only';

import type { SiteContent } from '@/lib/content';

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

function buildFallbackI18n(content: SiteContent): NonNullable<SiteContent['i18n']> {
  return {
    es: {
      hero: { tagline: content.hero.tagline, scrollText: content.hero.scrollText },
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
        images: content.portfolio.images.map((img) => ({ id: img.id, title: img.title })),
      },
      contact: {
        sectionLabel: content.contact.sectionLabel,
        heading: content.contact.heading,
        location: content.contact.location,
        whatsappText: content.contact.whatsappText,
        ctaText: content.contact.ctaText,
        quote: content.contact.quote,
      },
      footer: { rights: content.footer.rights, tagline: content.footer.tagline },
    },
    en: {
      hero: { tagline: content.hero.tagline, scrollText: content.hero.scrollText },
      about: {
        sectionLabel: 'About',
        heading: content.about.heading,
        bio: content.about.bio,
        quote: content.about.quote,
        location: content.about.location,
        details: content.about.details,
        established: content.about.established,
      },
      specialties: {
        sectionLabel: 'The Craft.',
        items: content.specialties.items,
      },
      portfolio: {
        sectionLabel: 'THE WORK.',
        subtitle: 'Selected pieces. All custom. All permanent.',
        images: content.portfolio.images.map((img) => ({ id: img.id, title: img.title })),
      },
      contact: {
        sectionLabel: 'Book a Session',
        heading: content.contact.heading,
        location: content.contact.location,
        whatsappText: content.contact.whatsappText,
        ctaText: content.contact.ctaText,
        quote: content.contact.quote,
      },
      footer: { rights: content.footer.rights, tagline: content.footer.tagline },
    },
  };
}

export function buildContentWithFallbackI18n(content: SiteContent): SiteContent {
  return {
    ...content,
    i18n: buildFallbackI18n(content),
  };
}

export async function translateToEnglish(text: string): Promise<string> {
  if (!text?.trim()) return text;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY');
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Translate the following text from Spanish to English.
Return ONLY the translated text, no explanations, no quotes, no extra text.
Keep proper nouns, brand names, and social media handles unchanged.
Text to translate: ${text}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 500,
        },
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Gemini API error (${res.status})`);
  }

  const data = (await res.json()) as GeminiResponse;
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? text;
}

export async function translateSiteContent(content: SiteContent): Promise<SiteContent> {
  const [
    tagline,
    scrollText,
    aboutHeading,
    aboutBio,
    aboutQuote,
    aboutLocation,
    aboutDetails,
    contactHeading,
    contactLocation,
    contactWhatsappText,
    contactCtaText,
    contactQuote,
    footerTagline,
    footerRights,
    specialtyItems,
    portfolioTitleItems,
  ] = await Promise.all([
    translateToEnglish(content.hero.tagline),
    translateToEnglish(content.hero.scrollText),
    translateToEnglish(content.about.heading),
    translateToEnglish(content.about.bio),
    translateToEnglish(content.about.quote),
    translateToEnglish(content.about.location),
    translateToEnglish(content.about.details),
    translateToEnglish(content.contact.heading),
    translateToEnglish(content.contact.location),
    translateToEnglish(content.contact.whatsappText),
    translateToEnglish(content.contact.ctaText),
    translateToEnglish(content.contact.quote),
    translateToEnglish(content.footer.tagline),
    translateToEnglish(content.footer.rights),
    Promise.all(content.specialties.items.map(translateToEnglish)),
    Promise.all(content.portfolio.images.map((img) => translateToEnglish(img.title))),
  ]);

  return {
    ...content,
    i18n: {
      ...buildFallbackI18n(content),
      en: {
        hero: { tagline, scrollText },
        about: {
          sectionLabel: 'About',
          heading: aboutHeading,
          bio: aboutBio,
          quote: aboutQuote,
          location: aboutLocation,
          details: aboutDetails,
          established: content.about.established,
        },
        specialties: {
          sectionLabel: 'The Craft.',
          items: specialtyItems,
        },
        portfolio: {
          sectionLabel: 'THE WORK.',
          subtitle: 'Selected pieces. All custom. All permanent.',
          images: content.portfolio.images.map((img, index) => ({
            id: img.id,
            title: portfolioTitleItems[index] ?? img.title,
          })),
        },
        contact: {
          sectionLabel: 'Book a Session',
          heading: contactHeading,
          location: contactLocation,
          whatsappText: contactWhatsappText,
          ctaText: contactCtaText,
          quote: contactQuote,
        },
        footer: { rights: footerRights, tagline: footerTagline },
      },
    },
  };
}