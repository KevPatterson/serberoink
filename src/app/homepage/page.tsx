import { LanguageProvider } from './components/LanguageContext';
import HomepageContent from './components/HomepageContent';
import { defaultSiteContent, getContent } from '@/lib/content';
import { cookies } from 'next/headers';

type Lang = 'en' | 'es';
const LANGUAGE_COOKIE_KEY = 'serbero_lang';
const LEGACY_LANGUAGE_COOKIE_KEY = 'serberoink-lang';

async function resolveInitialLang(): Promise<Lang> {
  const cookieStore = await cookies();
  const cookieLang =
    cookieStore.get(LANGUAGE_COOKIE_KEY)?.value?.trim().toLowerCase() ??
    cookieStore.get(LEGACY_LANGUAGE_COOKIE_KEY)?.value?.trim().toLowerCase();
  if (cookieLang === 'en' || cookieLang === 'es') {
    return cookieLang;
  }

  return 'es';
}

export default async function Homepage() {
  const initialLang = await resolveInitialLang();

  let content = defaultSiteContent;
  try {
    content = await getContent();
  } catch {
    content = defaultSiteContent;
  }

  const initialVersion = Number(content._meta?.version ?? 0);

  return (
    <LanguageProvider initialLanguage={initialLang}>
      <HomepageContent initialContent={content} initialVersion={initialVersion} />
    </LanguageProvider>
  );
}