import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText, Icon } from '../../../shared/components';
import { formatRating } from '../../../shared/utils/format';
import { colors, spacing } from '../../../theme';
import { providerKindKey } from '../../jobPost/providerKinds';
import type { ProviderKindStats } from '../types';

/** A single review can swing an average, so the score only shows once a few exist. */
const MIN_RATINGS_TO_SHOW = 3;

interface KindStatsListProps {
  stats: ProviderKindStats[];
}

/** Services done and rating of a provider, one line per role. */
export function KindStatsList({ stats }: KindStatsListProps) {
  const { t } = useTranslation();

  if (stats.length === 0) {
    return (
      <AppText variant="body" color={colors.textSecondary}>
        {t('member.stats.empty')}
      </AppText>
    );
  }

  return (
    <View style={styles.list}>
      {stats.map(item => (
        <View key={item.kind} style={styles.row}>
          <View style={styles.copy}>
            <AppText variant="bodyStrong">
              {t(`serviceRequest.step1.providers.${providerKindKey(item.kind)}.label` as never)}
            </AppText>
            <AppText variant="caption" color={colors.textMuted}>
              {t('member.stats.services', { count: item.completedServices })}
            </AppText>
          </View>

          {item.ratingsCount >= MIN_RATINGS_TO_SHOW ? (
            <View style={styles.rating}>
              <Icon name="star" size={16} color={colors.primary} filled />
              <AppText variant="bodyStrong">{formatRating(item.averageRating)}</AppText>
              <AppText variant="caption" color={colors.textMuted}>
                {`(${item.ratingsCount})`}
              </AppText>
            </View>
          ) : (
            <AppText variant="caption" color={colors.textMuted}>
              {t('member.stats.newRating')}
            </AppText>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  copy: { flex: 1, gap: spacing.xxs },
  rating: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
