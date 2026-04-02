'use client';

import { UI_STRINGS } from '@/lib/ui-strings';
import { useLang } from '@/app/homepage/components/LanguageContext';

export function useUIStrings() {
  const { lang } = useLang();
  return UI_STRINGS[lang];
}
