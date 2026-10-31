import React, { useMemo, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';

import { useAuthStore } from '../../entities/auth/authStore';
import { useChatMessages, useSendChatMessage } from '../../entities/chat/useChat';
import type { ChatMessage } from '../../entities/chat/types';
import type { RootStackParamList } from '../../navigation/types';
import { AppText, Icon, Screen, ScreenHeader } from '../../shared/components';
import { formatTime } from '../../shared/utils/format';
import { colors, radius, spacing, typography } from '../../theme';

export function ChatConversationScreen() {
  const navigation = useNavigation();
  const { params } = useRoute<RouteProp<RootStackParamList, 'ChatConversation'>>();
  const userId = useAuthStore(state => state.user?.id);
  const [text, setText] = useState('');
  const { data: messages, refetch, isRefetching } = useChatMessages(params.conversationId);
  const { mutateAsync: sendMessage, isPending } = useSendChatMessage(params.conversationId);
  const orderedMessages = useMemo(() => messages ?? [], [messages]);

  async function send() {
    const trimmed = text.trim();
    if (!trimmed || isPending) return;
    try {
      await sendMessage(trimmed);
      setText('');
    } catch {
      Alert.alert('Mensagem não enviada', 'Verifique sua conexão e tente novamente.');
    }
  }

  return (
    <Screen>
      <ScreenHeader title={params.title} onBack={navigation.goBack} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={12}>
        <View style={styles.context}>
          <Icon name="note" size={16} color={colors.primaryPressed} />
          <AppText variant="caption" color={colors.textSecondary} numberOfLines={1} style={styles.contextText}>
            {params.context}
          </AppText>
        </View>
        <FlatList
          data={orderedMessages}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messages}
          onRefresh={() => { refetch(); }}
          refreshing={isRefetching}
          renderItem={({ item }) => <MessageBubble message={item} mine={item.senderUserId === userId} />}
          ListEmptyComponent={<View style={styles.empty}><Icon name="message" size={28} color={colors.textMuted} /><AppText variant="body" color={colors.textSecondary} align="center">Envie a primeira mensagem para começar.</AppText></View>}
        />
        <View style={styles.composer}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Escreva uma mensagem"
            placeholderTextColor={colors.textMuted}
            maxLength={2000}
            multiline
            style={styles.input}
            accessibilityLabel="Mensagem"
          />
          <Pressable
            onPress={() => { send(); }}
            disabled={!text.trim() || isPending}
            accessibilityRole="button"
            accessibilityLabel="Enviar mensagem"
            style={({ pressed }) => [styles.send, (!text.trim() || isPending) ? styles.sendDisabled : null, pressed && text.trim() ? styles.sendPressed : null]}>
            <Icon name="navigate" size={19} color={colors.onPrimary} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function MessageBubble({ message, mine }: { message: ChatMessage; mine: boolean }) {
  return (
    <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleOther]}>
      <AppText variant="body" color={mine ? colors.onPrimary : colors.textPrimary}>{message.text}</AppText>
      <AppText variant="caption" color={mine ? colors.onHeroMuted : colors.textMuted} style={styles.messageTime}>{formatTime(message.createdAt)}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  context: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginHorizontal: spacing.lg, marginTop: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.primarySoft, borderRadius: radius.md },
  contextText: { flex: 1 },
  messages: { padding: spacing.lg, gap: spacing.sm, flexGrow: 1, justifyContent: 'flex-end' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingHorizontal: spacing.huge },
  bubble: { maxWidth: '82%', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md, gap: spacing.xxs },
  bubbleMine: { alignSelf: 'flex-end', backgroundColor: colors.heroBackground, borderBottomRightRadius: spacing.xs },
  bubbleOther: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: spacing.xs },
  messageTime: { alignSelf: 'flex-end' },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderTopWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  input: { flex: 1, maxHeight: 112, minHeight: 44, backgroundColor: colors.surfaceAlt, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, ...typography.body },
  send: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.primary },
  sendDisabled: { opacity: 0.4 },
  sendPressed: { backgroundColor: colors.primaryPressed },
});
