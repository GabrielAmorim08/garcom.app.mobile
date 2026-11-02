import React from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { useChatInbox } from '../../entities/chat/useChat';
import type { ChatConversation } from '../../entities/chat/types';
import { TabScreen } from '../../navigation/TabScreen';
import { AppText, Avatar, EmptyState } from '../../shared/components';
import { formatTime } from '../../shared/utils/format';
import { colors, radius, spacing } from '../../theme';

/**
 * Conversations are opened from a candidate profile; this inbox works for both
 * companies and providers, and periodically refreshes when a thread is open.
 */
export function MessagesScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { data: conversations, isLoading, isRefetching, refetch } = useChatInbox();

  return (
    <TabScreen title={t('tabs.messages')}>
      {isLoading ? (
        <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
      ) : (
        <FlatList
          data={conversations ?? []}
          keyExtractor={item => item.id}
          contentContainerStyle={conversations?.length ? styles.list : styles.empty}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => { refetch(); }} />}
          renderItem={({ item }) => (
            <ConversationRow
              item={item}
              onPress={() => navigation.navigate('ChatConversation', {
                conversationId: item.id,
                title: item.otherUserName,
                context: `Vaga #${item.jobReferenceCode} · ${item.jobTitle}`,
              })}
            />
          )}
          ListEmptyComponent={<EmptyState icon="message" title="Nenhuma conversa" message="As conversas com profissionais e empresas aparecerão aqui." />}
        />
      )}
    </TabScreen>
  );
}

function ConversationRow({ item, onPress }: { item: ChatConversation; onPress: () => void }) {
  const { t } = useTranslation();

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed ? styles.rowPressed : null]}>
      <Avatar name={item.otherUserName} uri={item.otherUserPhotoPath} size={48} />
      <View style={styles.rowText}>
        <View style={styles.rowTop}>
          <AppText variant="bodyStrong" numberOfLines={1} style={styles.name}>{item.otherUserName}</AppText>
          {item.lastMessageAt ? <AppText variant="caption" color={colors.textMuted}>{formatTime(item.lastMessageAt)}</AppText> : null}
        </View>
        <View style={styles.rowBottom}>
          <AppText variant="caption" color={colors.textSecondary} numberOfLines={1} style={styles.preview}>
            {item.lastMessagePreview ?? t('chat.noMessagesYet')}
          </AppText>
          {item.unreadCount > 0 ? <View style={styles.unread}><AppText variant="caption" color={colors.onPrimary}>{item.unreadCount > 9 ? '9+' : item.unreadCount}</AppText></View> : null}
        </View>
        <AppText variant="caption" color={colors.textMuted} numberOfLines={1}>{`#${item.jobReferenceCode} · ${item.jobTitle}`}</AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: spacing.xl, paddingBottom: spacing.huge, gap: spacing.sm },
  empty: { flexGrow: 1, padding: spacing.xl, justifyContent: 'center' },
  row: { flexDirection: 'row', gap: spacing.md, padding: spacing.md, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  rowPressed: { backgroundColor: colors.surfaceAlt },
  rowText: { flex: 1, minWidth: 0, gap: spacing.xxs },
  rowTop: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  rowBottom: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  name: { flex: 1 },
  preview: { flex: 1 },
  unread: { minWidth: 20, height: 20, paddingHorizontal: spacing.xs, borderRadius: radius.pill, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
});
