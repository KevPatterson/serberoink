import { LanguageProvider } from './components/LanguageContext';
import HomepageContent from './components/HomepageContent';
import { defaultSiteContent, getContent } from '@/lib/content';
import { cookies, headers } from 'next/headers';

type Lang = 'en' | 'es';

function resolveLangFromAcceptLanguage(acceptLanguage: string | null): Lang {
  if (!acceptLanguage) return 'es';
  return acceptLanguage.toLowerCase().includes('es') ? 'es' : 'en';
}

async function resolveInitialLang(): Promise<Lang> {
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get('serberoink-lang')?.value?.trim().toLowerCase();
  if (cookieLang === 'en' || cookieLang === 'es') {
    return cookieLang;
  }

  const requestHeaders = await headers();
  return resolveLangFromAcceptLanguage(requestHeaders.get('accept-language'));
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
    <LanguageProvider initialLang={initialLang}>
      <HomepageContent initialContent={content} initialVersion={initialVersion} />
    </LanguageProvider>
  );
}