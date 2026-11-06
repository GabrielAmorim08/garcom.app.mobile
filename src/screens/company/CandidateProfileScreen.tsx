import React from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import type { RootStackParamList } from '../../navigation/types';
import { AppText, Avatar, Button, Card, Icon, Screen, ScreenHeader } from '../../shared/components';
import { useOpenChatConversation } from '../../entities/chat/useChat';
import { KindStatsList } from '../../entities/user/components/KindStatsList';
import { formatMemberNumber, formatRating } from '../../shared/utils/format';
import { colors, radius, spacing } from '../../theme';

export function CandidateProfileScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { params } = useRoute<RouteProp<RootStackParamList, 'CandidateProfile'>>();
  const { applicant, jobPostId } = params;
  const hasRatings = applicant.ratingsCount > 0;
  const { mutateAsync: openConversation, isPending: isOpeningConversation } = useOpenChatConversation();

  async function startConversation() {
    try {
      const conversation = await openConversation({ jobPostId, waiterUserId: applicant.waiterUserId });
      navigation.navigate('ChatConversation', {
        conversationId: conversation.id,
        title: applicant.fullName,
        context: `Vaga #${conversation.jobReferenceCode} · ${conversation.jobTitle}`,
      });
    } catch {
      Alert.alert('Não foi possível iniciar a conversa', 'Tente novamente em instantes.');
    }
  }

  return (
    <Screen>
      <ScreenHeader title="Perfil do candidato" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Avatar name={applicant.fullName} uri={applicant.profilePhotoPath} size={96} />
          <AppText variant="title" align="center">{applicant.fullName}</AppText>
          {applicant.memberNumber ? (
            <AppText variant="captionStrong" color={colors.primaryPressed}>
              {t('member.number', { number: formatMemberNumber(applicant.memberNumber) })}
            </AppText>
          ) : null}
          <View style={styles.ratingLine}>
            <Icon name="star" size={22} color={colors.primary} filled />
            <AppText variant="subtitle">{formatRating(applicant.averageRating)}</AppText>
            <AppText variant="body" color={colors.textMuted}>
              {t('company.serviceDetail.reviewCount', { count: applicant.ratingsCount })}
            </AppText>
          </View>
        </View>

        <Card style={styles.stats}>
          <Stat value={String(applicant.completedServices)} label="serviços concluídos" />
          <View style={styles.divider} />
          <Stat value={hasRatings ? formatRating(applicant.averageRating) : 'Novo'} label="reputação" />
          <View style={styles.divider} />
          <Stat value={applicant.distanceMeters == null ? '—' : `${Math.round(applicant.distanceMeters / 1000)} km`} label="distância" />
        </Card>

        {applicant.kindStats && applicant.kindStats.length > 0 ? (
          <Card style={styles.section}>
            <AppText variant="subtitle">{t('member.stats.title')}</AppText>
            <KindStatsList stats={applicant.kindStats} />
          </Card>
        ) : null}

        {applicant.message ? (
          <Card style={styles.section}>
            <AppText variant="subtitle">Apresentação</AppText>
            <AppText variant="body" color={colors.textSecondary}>{applicant.message}</AppText>
          </Card>
        ) : null}

        <Card style={styles.section}>
          <View style={styles.sectionTitle}>
            <AppText variant="subtitle">Avaliações</AppText>
            <View style={styles.starPill}><Icon name="star" size={16} color={colors.primary} filled /><AppText variant="bodyStrong">{formatRating(applicant.averageRating)}</AppText></View>
          </View>
          <AppText variant="body" color={colors.textSecondary}>
            {hasRatings
              ? `Baseado em ${applicant.ratingsCount} avaliações de estabelecimentos atendidos.`
              : 'Este profissional ainda não recebeu avaliações na plataforma.'}
          </AppText>
        </Card>
        <Button
          label="Enviar mensagem"
          icon={<Icon name="message" size={19} color={colors.onPrimary} />}
          loading={isOpeningConversation}
          onPress={() => { startConversation(); }}
        />
      </ScrollView>
    </Screen>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return <View style={styles.stat}><AppText variant="subtitle" align="center">{value}</AppText><AppText variant="caption" color={colors.textMuted} align="center">{label}</AppText></View>;
}

const styles = StyleSheet.create({
  content: { padding: spacing.xl, paddingBottom: spacing.huge, gap: spacing.lg },
  hero: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  ratingLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stats: { flexDirection: 'row', alignItems: 'stretch', paddingVertical: spacing.lg },
  stat: { flex: 1, gap: spacing.xs },
  divider: { width: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  section: { gap: spacing.md },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  starPill: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.primarySoft, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
});
