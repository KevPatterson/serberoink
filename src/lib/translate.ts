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

interface GeminiErrorResponse {
  error?: {
    message?: string;
    status?: string;
  };
}

async function callGemini(prompt: string, maxOutputTokens = 500): Promise<string> {
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
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens,
        },
      }),
    }
  );

  if (!res.ok) {
    let reason = '';
    try {
      const errorData = (await res.json()) as GeminiErrorResponse;
      reason = errorData.error?.message?.trim() || errorData.error?.status?.trim() || '';
    } catch {
      // Ignore JSON parse failures and keep status-only error.
    }

    throw new Error(
      reason ? `Gemini API error (${res.status}): ${reason}` : `Gemini API error (${res.status})`
    );
  }

  const data = (await res.json()) as GeminiResponse;
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
}

function stripJsonCodeFence(text: string): string {
  return text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
}

async function translateManyToEnglish(texts: string[]): Promise<string[]> {
  if (texts.length === 0) return [];

  const prompt = [
    'Translate each item from Spanish to English.',
    'Return ONLY a valid JSON array of strings with the same length and same order.',
    'Do not include explanations or markdown.',
    'Keep proper nouns, brand names, and social media handles unchanged.',
    `Input: ${JSON.stringify(texts)}`,
  ].join('\n');

  const raw = await callGemini(prompt, 2200);
  const parsed = JSON.parse(stripJsonCodeFence(raw)) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error('Gemini batch translation returned non-array response');
  }

  if (parsed.length !== texts.length) {
    throw new Error('Gemini batch translation returned unexpected array length');
  }

  return parsed.map((item, index) => {
    if (typeof item === 'string') {
      const normalized = item.trim();
      return normalized || texts[index];
    }
    return texts[index];
  });
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
  const fallback = buildFallbackI18n(content);
  const previousEnglish = content.i18n?.en;

  return {
    ...content,
    i18n: {
      es: fallback.es,
      en: previousEnglish ?? fallback.en,
    },
  };
}

export async function translateToEnglish(text: string): Promise<string> {
  if (!text?.trim()) return text;
  return (
    (await callGemini(
      `Translate the following text from Spanish to English.
Return ONLY the translated text, no explanations, no quotes, no extra text.
Keep proper nouns, brand names, and social media handles unchanged.
Text to translate: ${text}`,
      500
    )) || text
  );
}

export async function translateSiteContent(content: SiteContent): Promise<SiteContent> {
  const fixedFields = [
    content.hero.tagline,
    content.hero.scrollText,
    content.about.heading,
    content.about.bio,
    content.about.quote,
    content.about.location,
    content.about.details,
    content.contact.heading,
    content.contact.location,
    content.contact.whatsappText,
    content.contact.ctaText,
    content.contact.quote,
    content.footer.tagline,
    content.footer.rights,
  ];

  const allTexts = [
    ...fixedFields,
    ...content.specialties.items,
    ...content.portfolio.images.map((img) => img.title),
  ];

  const translated = await translateManyToEnglish(allTexts);

  const tagline = translated[0];
  const scrollText = translated[1];
  const aboutHeading = translated[2];
  const aboutBio = translated[3];
  const aboutQuote = translated[4];
  const aboutLocation = translated[5];
  const aboutDetails = translated[6];
  const contactHeading = translated[7];
  const contactLocation = translated[8];
  const contactWhatsappText = translated[9];
  const contactCtaText = translated[10];
  const contactQuote = translated[11];
  const footerTagline = translated[12];
  const footerRights = translated[13];

  const specialtiesStart = fixedFields.length;
  const specialtiesEnd = specialtiesStart + content.specialties.items.length;
  const specialtyItems = translated.slice(specialtiesStart, specialtiesEnd);
  const portfolioTitleItems = translated.slice(specialtiesEnd);

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