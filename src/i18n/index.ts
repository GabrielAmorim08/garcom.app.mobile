import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { findBestLanguageTag } from 'react-native-localize';

import { en } from './locales/en';
import { ptBR } from './locales/pt-BR';

export const resources = {
  'pt-BR': { translation: ptBR },
  en: { translation: en },
} as const;

export const supportedLanguages = Object.keys(resources) as Array<keyof typeof resources>;

export const fallbackLanguage = 'pt-BR';

function detectLanguage(): string {
  const best = findBestLanguageTag(supportedLanguages);
  return best?.languageTag ?? fallbackLanguage;
}

void i18n.use(initReactI18next).init({
  resources,
  lng: detectLanguage(),
  fallbackLng: fallbackLanguage,
  // React already escapes rendered output; escaping here would double-encode accents.
  interpolation: { escapeValue: false },
  returnNull: false,
});

export function changeLanguage(language: keyof typeof resources) {
  return i18n.changeLanguage(language);
}

export default i18n;
