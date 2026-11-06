import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { JobPostCard } from '../../entities/jobPost/components/JobPostCard';
import { PROVIDER_KINDS, providerKindKey } from '../../entities/jobPost/providerKinds';
import type { ProviderKind } from '../../entities/jobPost/types';
import { useNearbyJobPosts } from '../../entities/jobPost/useJobPosts';
import { useWaiterProfile } from '../../entities/user/useUser';
import {
  AppText,
  EmptyState,
  ListSeparator,
  Icon,
  MapPreview,
  SegmentedControl,
} from '../../shared/components';
import { TabScreen } from '../../navigation/TabScreen';
import { useCurrentLocation } from '../../shared/hooks/useCurrentLocation';
import { useTabBarClearance } from '../../shared/hooks/useTabBarClearance';
import { httpClient } from '../../shared/api/httpClient';
import type { GeoPoint } from '../../shared/types/common';
import { colors, radius, spacing } from '../../theme';

type ViewMode = 'map' | 'list';

export function NearbyServicesScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const tabBarClearance = useTabBarClearance();
  const { location: deviceLocation, request: requestLocation, isLocating } = useCurrentLocation({ autoRequest: true });

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [radiusKm, setRadiusKm] = useState(10);
  const [customLocation, setCustomLocation] = useState<GeoPoint | null>(null);
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [postalCode, setPostalCode] = useState('');
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [searchAddress, setSearchAddress] = useState<string | null>(null);
  const [providerFilter, setProviderFilter] = useState<ProviderKind | null>(null);

  const { data: profile } = useWaiterProfile();
  useEffect(() => {
    if (profile?.searchRadiusMeters) setRadiusKm(Math.round(profile.searchRadiusMeters / 1000));
  }, [profile?.searchRadiusMeters]);

  const location = customLocation ?? deviceLocation;

  useEffect(() => {
    if (!location || customLocation) return;

    resolveAddress(location).then(setSearchAddress).catch(() => setSearchAddress(null));
  }, [customLocation, location]);
  const { data, isLoading, refetch, isRefetching } = useNearbyJobPosts({
    latitude: location.latitude,
    longitude: location.longitude,
    radiusMeters: radiusKm * 1000,
  });

  const ownKinds = profile?.providerKinds ?? [];
  const orderedKinds = [
    ...PROVIDER_KINDS.filter(kind => ownKinds.includes(kind)),
    ...PROVIDER_KINDS.filter(kind => !ownKinds.includes(kind)),
  ];

  const allItems = data?.items ?? [];
  const items = providerFilter ? allItems.filter(item => item.providerKind === providerFilter) : allItems;

  async function refreshLocation() {
    const point = await requestLocation();
    if (point) {
      setCustomLocation(null);
      setLocationError(null);
      setSearchAddress(await resolveAddress(point));
    }
  }

  async function searchByPostalCode() {
    const digits = postalCode.replace(/\D/g, '');
    if (digits.length !== 8) {
      setLocationError('Informe um CEP com 8 dígitos.');
      return;
    }
    setIsSearchingLocation(true);
    setLocationError(null);
    try {
      const { data: result } = await httpClient.get<{
        latitude?: number | null;
        longitude?: number | null;
        street?: string | null;
        district?: string | null;
        city?: string | null;
        state?: string | null;
      }>(`/postal-codes/${digits}`);
      if (result.latitude == null || result.longitude == null) throw new Error('not-found');
      setCustomLocation({ latitude: result.latitude, longitude: result.longitude });
      setSearchAddress([result.street, result.district, [result.city, result.state].filter(Boolean).join(' - ')]
        .filter(Boolean)
        .join(', ') || `CEP ${postalCode}`);
      setShowLocationSearch(false);
    } catch {
      setLocationError('Não foi possível encontrar esse CEP.');
    } finally {
      setIsSearchingLocation(false);
    }
  }

  return (
    <TabScreen title={t('waiter.nearby.title')}>
      <View style={styles.controls}>
        <View style={styles.locationRow}>
          <View style={styles.locationCopy}>
            <Icon name="pin" size={18} color={colors.primaryPressed} />
            <AppText
              variant="captionStrong"
              color={colors.textSecondary}
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.locationAddress}>
              {searchAddress ?? 'Identificando sua localização...'}
            </AppText>
          </View>
          <Pressable onPress={() => setShowLocationSearch(value => !value)} style={styles.locationAction}>
            <AppText variant="captionStrong" color={colors.primaryPressed}>Alterar</AppText>
          </Pressable>
        </View>

        {showLocationSearch ? (
          <View style={styles.locationSearch}>
            <TextInput
              value={postalCode}
              onChangeText={value => setPostalCode(value.replace(/\D/g, '').slice(0, 8))}
              placeholder="Digite o CEP"
              keyboardType="number-pad"
              style={styles.postalCodeInput}
            />
            <Pressable onPress={searchByPostalCode} style={styles.searchButton}>
              {isSearchingLocation ? <ActivityIndicator color={colors.onPrimary} /> : <AppText variant="captionStrong" color={colors.onPrimary}>Buscar</AppText>}
            </Pressable>
            <Pressable onPress={refreshLocation} style={styles.currentLocationButton}>
              <Icon name="navigate" size={16} color={colors.primaryPressed} />
              <AppText variant="captionStrong" color={colors.primaryPressed}>{isLocating ? 'Localizando...' : 'Minha localização'}</AppText>
            </Pressable>
            {locationError ? <AppText variant="caption" color={colors.danger}>{locationError}</AppText> : null}
          </View>
        ) : null}

        <View style={styles.radiusRow}>
          <AppText variant="caption" color={colors.textMuted}>Raio de busca</AppText>
          <View style={styles.radiusOptions}>
            {[5, 10, 20, 50].map(value => (
              <Pressable key={value} onPress={() => setRadiusKm(value)} style={[styles.radiusChip, radiusKm === value && styles.radiusChipActive]}>
                <AppText variant="captionStrong" color={radiusKm === value ? colors.onPrimary : colors.textSecondary}>{value} km</AppText>
              </Pressable>
            ))}
          </View>
        </View>

        {profile && ownKinds.length === 0 ? (
          <Pressable onPress={() => navigation.navigate('WaiterProfileEdit')} style={styles.kindsPrompt}>
            <View style={styles.kindsPromptCopy}>
              <AppText variant="bodyStrong">{t('waiter.nearby.noKindsTitle')}</AppText>
              <AppText variant="caption" color={colors.textSecondary}>{t('waiter.nearby.noKindsHint')}</AppText>
            </View>
            <AppText variant="captionStrong" color={colors.primaryPressed}>{t('waiter.nearby.noKindsAction')}</AppText>
          </Pressable>
        ) : null}

        <View style={styles.radiusRow}>
          <AppText variant="caption" color={colors.textMuted}>{t('waiter.nearby.filterLabel')}</AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kindOptions}>
            <KindChip label={t('waiter.nearby.filterAll')} active={providerFilter === null} onPress={() => setProviderFilter(null)} />
            {orderedKinds.map(kind => (
              <KindChip
                key={kind}
                label={t(`serviceRequest.step1.providers.${providerKindKey(kind)}.label` as never)}
                active={providerFilter === kind}
                onPress={() => setProviderFilter(kind)}
              />
            ))}
          </ScrollView>
        </View>
      </View>

      <View style={styles.switcher}>
        <View style={styles.switcherControl}>
          <SegmentedControl<ViewMode>
            value={viewMode}
            onChange={setViewMode}
            options={[
              { value: 'map', label: t('common.map') },
              { value: 'list', label: t('common.list') },
            ]}
          />
        </View>

      </View>

      {viewMode === 'map' ? (
        <View style={styles.mapWrapper}>
          <MapPreview
            location={location}
            height={360}
            interactive
            markers={items.flatMap(item =>
              item.location ? [{ id: item.id, location: item.location }] : [],
            )}
            onMarkerPress={jobPostId => navigation.navigate('ServiceDetail', { jobPostId })}
          />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: spacing.xxl + tabBarClearance },
          ]}
          onRefresh={refetch}
          refreshing={isRefetching}
          ItemSeparatorComponent={ListSeparator}
          renderItem={({ item }) => (
            <JobPostCard
              jobPost={item}
              onPress={() => navigation.navigate('ServiceDetail', { jobPostId: item.id })}
            />
          )}
          ListEmptyComponent={
            isLoading ? (
              <AppText variant="caption" align="center" style={styles.loading}>
                {t('common.loading')}
              </AppText>
            ) : (
              <EmptyState
                title={t(providerFilter ? 'waiter.nearby.emptyFiltered' : 'waiter.nearby.empty')}
                message={t(providerFilter ? 'waiter.nearby.emptyFilteredHint' : 'waiter.nearby.emptyHint')}
              />
            )
          }
        />
      )}
    </TabScreen>
  );
}

function KindChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[styles.kindChip, active && styles.radiusChipActive]}>
      <AppText variant="captionStrong" color={active ? colors.onPrimary : colors.textSecondary}>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  switcherControl: { flex: 1 },
  kindOptions: { gap: spacing.xs },
  kindsPrompt: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.primarySoft },
  kindsPromptCopy: { flex: 1, gap: spacing.xxs },
  kindChip: { alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  controls: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, gap: spacing.md },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  locationCopy: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  locationAddress: { flex: 1, flexShrink: 1 },
  locationAction: { flexShrink: 0, padding: spacing.xs },
  locationSearch: { gap: spacing.sm },
  postalCodeInput: { minHeight: 44, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface, paddingHorizontal: spacing.md, color: colors.textPrimary },
  searchButton: { minHeight: 44, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  currentLocationButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.xs, minHeight: 40 },
  radiusRow: { gap: spacing.sm },
  radiusOptions: { flexDirection: 'row', gap: spacing.xs },
  radiusChip: { flex: 1, minWidth: 0, alignItems: 'center', paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  radiusChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  switcher: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  mapWrapper: { paddingHorizontal: spacing.xl },
  list: { paddingHorizontal: spacing.xl },
  loading: { paddingVertical: spacing.huge },
});

async function resolveAddress(point: GeoPoint): Promise<string | null> {
  try {
    const { data } = await httpClient.get<{
      street?: string | null;
      number?: string | null;
      district?: string | null;
      city?: string | null;
      state?: string | null;
    }>('/geocoding/reverse', { params: { latitude: point.latitude, longitude: point.longitude } });

    return [
      [data.street, data.number].filter(Boolean).join(', '),
      data.district,
      [data.city, data.state].filter(Boolean).join(' - '),
    ].filter(Boolean).join(' · ') || null;
  } catch {
    return null;
  }
}
