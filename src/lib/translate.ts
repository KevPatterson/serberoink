import 'server-only';

import type { SiteContent } from '@/lib/content';

type TranslationProvider = 'azure' | 'gemini';

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

interface AzureErrorResponse {
  error?: {
    code?: number | string;
    message?: string;
  };
}

interface AzureTranslationItem {
  translations?: Array<{
    text?: string;
  }>;
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

function normalizeAzureEndpoint(): string {
  const endpoint =
    process.env.AZURE_TRANSLATOR_ENDPOINT?.trim() || 'https://api.cognitive.microsofttranslator.com';
  return endpoint.replace(/\/+$/, '');
}

async function callAzureTranslate(texts: string[]): Promise<string[]> {
  const apiKey = process.env.AZURE_TRANSLATOR_KEY;
  if (!apiKey) {
    throw new Error('Missing AZURE_TRANSLATOR_KEY');
  }

  const region = process.env.AZURE_TRANSLATOR_REGION?.trim();
  const endpoint = normalizeAzureEndpoint();
  const url = `${endpoint}/translate?api-version=3.0&from=es&to=en`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Ocp-Apim-Subscription-Key': apiKey,
  };
  if (region) {
    headers['Ocp-Apim-Subscription-Region'] = region;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(texts.map((text) => ({ text }))),
  });

  if (!res.ok) {
    let reason = '';
    try {
      const errorData = (await res.json()) as AzureErrorResponse;
      reason = errorData.error?.message?.trim() || '';
    } catch {
      // Keep status-only error when Azure response body is not JSON.
    }

    throw new Error(
      reason ? `Azure Translator error (${res.status}): ${reason}` : `Azure Translator error (${res.status})`
    );
  }

  const data = (await res.json()) as AzureTranslationItem[];
  return texts.map((original, index) => {
    const translated = data[index]?.translations?.[0]?.text?.trim();
    return translated || original;
  });
}

function stripJsonCodeFence(text: string): string {
  return text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
}

interface TextsToTranslate {
  heroTagline: string;
  heroScrollText: string;
  aboutHeading: string;
  aboutBio: string;
  aboutQuote: string;
  aboutLocation: string;
  aboutDetails: string;
  contactHeading: string;
  contactLocation: string;
  contactWhatsappText: string;
  contactCtaText: string;
  contactQuote: string;
  footerTagline: string;
  footerRights: string;
  specialtyItems: string[];
  portfolioTitles: string[];
}

function asTranslatedText(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const normalized = value.trim();
  return normalized || fallback;
}

function asTranslatedStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  return fallback.map((item, index) => asTranslatedText(value[index], item));
}

function getProviderOrder(): TranslationProvider[] {
  const preference = (process.env.TRANSLATION_PROVIDER || 'auto').trim().toLowerCase();

  if (preference === 'azure') return ['azure', 'gemini'];
  if (preference === 'gemini') return ['gemini', 'azure'];
  return ['azure', 'gemini'];
}

async function translateManyWithGemini(texts: string[]): Promise<string[]> {
  if (texts.length === 0) return [];

  const prompt = [
    'Translate each item from Spanish to English.',
    'Return ONLY a valid JSON array of strings with the same length and same order.',
    'Do not include explanations or markdown.',
    'Keep proper nouns, brand names, city names, and social media handles unchanged.',
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

  return texts.map((item, index) => asTranslatedText(parsed[index], item));
}

async function translateManyToEnglish(texts: string[]): Promise<string[]> {
  if (texts.length === 0) return [];

  const errors: string[] = [];

  for (const provider of getProviderOrder()) {
    try {
      if (provider === 'azure') {
        return await callAzureTranslate(texts);
      }
      return await translateManyWithGemini(texts);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : `${provider} translation failed`);
    }
  }

  throw new Error(`All translation providers failed: ${errors.join(' | ')}`);
}

async function translateStructuredContent(payload: TextsToTranslate): Promise<TextsToTranslate> {
  const fixed = [
    payload.heroTagline,
    payload.heroScrollText,
    payload.aboutHeading,
    payload.aboutBio,
    payload.aboutQuote,
    payload.aboutLocation,
    payload.aboutDetails,
    payload.contactHeading,
    payload.contactLocation,
    payload.contactWhatsappText,
    payload.contactCtaText,
    payload.contactQuote,
    payload.footerTagline,
    payload.footerRights,
  ];

  const translatedAll = await translateManyToEnglish([
    ...fixed,
    ...payload.specialtyItems,
    ...payload.portfolioTitles,
  ]);

  const translatedFixed = translatedAll.slice(0, fixed.length);
  const specialtyStart = fixed.length;
  const specialtyEnd = specialtyStart + payload.specialtyItems.length;
  const translatedSpecialties = translatedAll.slice(specialtyStart, specialtyEnd);
  const translatedPortfolioTitles = translatedAll.slice(specialtyEnd);

  return {
    heroTagline: asTranslatedText(translatedFixed[0], payload.heroTagline),
    heroScrollText: asTranslatedText(translatedFixed[1], payload.heroScrollText),
    aboutHeading: asTranslatedText(translatedFixed[2], payload.aboutHeading),
    aboutBio: asTranslatedText(translatedFixed[3], payload.aboutBio),
    aboutQuote: asTranslatedText(translatedFixed[4], payload.aboutQuote),
    aboutLocation: asTranslatedText(translatedFixed[5], payload.aboutLocation),
    aboutDetails: asTranslatedText(translatedFixed[6], payload.aboutDetails),
    contactHeading: asTranslatedText(translatedFixed[7], payload.contactHeading),
    contactLocation: asTranslatedText(translatedFixed[8], payload.contactLocation),
    contactWhatsappText: asTranslatedText(translatedFixed[9], payload.contactWhatsappText),
    contactCtaText: asTranslatedText(translatedFixed[10], payload.contactCtaText),
    contactQuote: asTranslatedText(translatedFixed[11], payload.contactQuote),
    footerTagline: asTranslatedText(translatedFixed[12], payload.footerTagline),
    footerRights: asTranslatedText(translatedFixed[13], payload.footerRights),
    specialtyItems: asTranslatedStringArray(translatedSpecialties, payload.specialtyItems),
    portfolioTitles: asTranslatedStringArray(translatedPortfolioTitles, payload.portfolioTitles),
  };
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
  const [translated] = await translateManyToEnglish([text]);
  return translated || text;
}

export async function translateSiteContent(content: SiteContent): Promise<SiteContent> {
  const translated = await translateStructuredContent({
    heroTagline: content.hero.tagline,
    heroScrollText: content.hero.scrollText,
    aboutHeading: content.about.heading,
    aboutBio: content.about.bio,
    aboutQuote: content.about.quote,
    aboutLocation: content.about.location,
    aboutDetails: content.about.details,
    contactHeading: content.contact.heading,
    contactLocation: content.contact.location,
    contactWhatsappText: content.contact.whatsappText,
    contactCtaText: content.contact.ctaText,
    contactQuote: content.contact.quote,
    footerTagline: content.footer.tagline,
    footerRights: content.footer.rights,
    specialtyItems: content.specialties.items,
    portfolioTitles: content.portfolio.images.map((img) => img.title),
  });

  return {
    ...content,
    i18n: {
      ...buildFallbackI18n(content),
      en: {
        hero: { tagline: translated.heroTagline, scrollText: translated.heroScrollText },
        about: {
          sectionLabel: 'About',
          heading: translated.aboutHeading,
          bio: translated.aboutBio,
          quote: translated.aboutQuote,
          location: translated.aboutLocation,
          details: translated.aboutDetails,
          established: content.about.established,
        },
        specialties: {
          sectionLabel: 'The Craft.',
          items: translated.specialtyItems,
        },
        portfolio: {
          sectionLabel: 'THE WORK.',
          subtitle: 'Selected pieces. All custom. All permanent.',
          images: content.portfolio.images.map((img, index) => ({
            id: img.id,
            title: translated.portfolioTitles[index] ?? img.title,
          })),
        },
        contact: {
          sectionLabel: 'Book a Session',
          heading: translated.contactHeading,
          location: translated.contactLocation,
          whatsappText: translated.contactWhatsappText,
          ctaText: translated.contactCtaText,
          quote: translated.contactQuote,
        },
        footer: { rights: translated.footerRights, tagline: translated.footerTagline },
      },
    },
  };
}