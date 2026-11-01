import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { LIVE_REFRESH_MS, queryKeys } from '../../shared/api/queryClient';
import { chatService } from './chatService';
import type { ChatConversation, ChatMessage, OpenConversationRequest } from './types';

export function useChatInbox() {
  return useQuery<ChatConversation[]>({
    queryKey: queryKeys.chat.inbox,
    queryFn: () => chatService.getInbox(),
    refetchInterval: LIVE_REFRESH_MS,
  });
}

/** Unread messages across every conversation, for the badge on the Messages tab. */
export function useUnreadMessagesCount(): number {
  const { data } = useChatInbox();

  return (data ?? []).reduce((total, conversation) => total + conversation.unreadCount, 0);
}

export function useChatMessages(conversationId: string) {
  return useQuery<ChatMessage[]>({
    queryKey: queryKeys.chat.messages(conversationId),
    queryFn: () => chatService.getMessages(conversationId),
    enabled: Boolean(conversationId),
    refetchInterval: 8_000,
  });
}

export function useOpenChatConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: OpenConversationRequest) => chatService.openConversation(payload),
    onSuccess: conversation => {
      queryClient.setQueryData<ChatConversation[]>(queryKeys.chat.inbox, current => {
        const rest = (current ?? []).filter(item => item.id !== conversation.id);
        return [conversation, ...rest];
      });
    },
  });
}

export function useSendChatMessage(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => chatService.sendMessage(conversationId, text),
    onSuccess: message => {
      queryClient.setQueryData<ChatMessage[]>(queryKeys.chat.messages(conversationId), current => [
        ...(current ?? []),
        message,
      ]);
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.inbox }).catch(() => undefined);
    },
  });
}
