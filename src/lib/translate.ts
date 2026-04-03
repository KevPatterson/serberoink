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

async function translateStructuredContent(payload: TextsToTranslate): Promise<TextsToTranslate> {
  const prompt = `Translate the following JSON object from Spanish to English.
Return ONLY a valid JSON object with the exact same keys.
Keep proper nouns, brand names, city names, and social media handles unchanged.
Do not add explanations, markdown, or code blocks. Return raw JSON only.

${JSON.stringify(payload, null, 2)}`;

  const raw = await callGemini(prompt, 2200);
  const parsed = JSON.parse(stripJsonCodeFence(raw)) as unknown;

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Gemini batch translation returned invalid JSON object');
  }

  const translated = parsed as Partial<TextsToTranslate>;

  return {
    heroTagline: asTranslatedText(translated.heroTagline, payload.heroTagline),
    heroScrollText: asTranslatedText(translated.heroScrollText, payload.heroScrollText),
    aboutHeading: asTranslatedText(translated.aboutHeading, payload.aboutHeading),
    aboutBio: asTranslatedText(translated.aboutBio, payload.aboutBio),
    aboutQuote: asTranslatedText(translated.aboutQuote, payload.aboutQuote),
    aboutLocation: asTranslatedText(translated.aboutLocation, payload.aboutLocation),
    aboutDetails: asTranslatedText(translated.aboutDetails, payload.aboutDetails),
    contactHeading: asTranslatedText(translated.contactHeading, payload.contactHeading),
    contactLocation: asTranslatedText(translated.contactLocation, payload.contactLocation),
    contactWhatsappText: asTranslatedText(translated.contactWhatsappText, payload.contactWhatsappText),
    contactCtaText: asTranslatedText(translated.contactCtaText, payload.contactCtaText),
    contactQuote: asTranslatedText(translated.contactQuote, payload.contactQuote),
    footerTagline: asTranslatedText(translated.footerTagline, payload.footerTagline),
    footerRights: asTranslatedText(translated.footerRights, payload.footerRights),
    specialtyItems: asTranslatedStringArray(translated.specialtyItems, payload.specialtyItems),
    portfolioTitles: asTranslatedStringArray(translated.portfolioTitles, payload.portfolioTitles),
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