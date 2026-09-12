import React from 'react';
import { useTranslation } from 'react-i18next';

import { EmptyState, Screen, ScreenHeader } from '../../shared/components';

/**
 * Placeholder for in-app chat, which is out of scope for the first release: the
 * phone number is shared once an application is accepted.
 */
export function MessagesScreen() {
  const { t } = useTranslation();

  return (
    <Screen>
      <ScreenHeader title={t('tabs.messages')} />
      <EmptyState icon="message" title={t('tabs.messages')} message={t('common.loading')} />
    </Screen>
  );
}
