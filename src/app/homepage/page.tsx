import { LanguageProvider } from './components/LanguageContext';
import HomepageContent from './components/HomepageContent';
import { defaultSiteContent, getContent } from '@/lib/content';

export default async function Homepage() {
  let content = defaultSiteContent;
  try {
    content = await getContent();
  } catch {
    content = defaultSiteContent;
  }

  return (
    <LanguageProvider>
      <HomepageContent content={content} />
    </LanguageProvider>
  );
}