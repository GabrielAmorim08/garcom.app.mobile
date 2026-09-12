import 'i18next';

import type { TranslationSchema } from './locales/pt-BR';

/**
 * Makes t() keys type-checked: a typo in a key becomes a compile error instead of
 * showing the raw key on screen.
 */
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: { translation: TranslationSchema };
    returnNull: false;
  }
}
