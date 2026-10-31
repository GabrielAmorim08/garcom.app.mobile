import { httpClient } from '../../shared/api/httpClient';
import type { ChatConversation, ChatMessage, OpenConversationRequest } from './types';

export const chatService = {
  async getInbox(): Promise<ChatConversation[]> {
    const { data } = await httpClient.get<ChatConversation[]>('/chat/conversations');
    return data;
  },

  async openConversation(payload: OpenConversationRequest): Promise<ChatConversation> {
    const { data } = await httpClient.post<ChatConversation>('/chat/conversations', payload);
    return data;
  },

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    const { data } = await httpClient.get<ChatMessage[]>(`/chat/conversations/${conversationId}/messages`);
    return data;
  },

  async sendMessage(conversationId: string, text: string): Promise<ChatMessage> {
    const { data } = await httpClient.post<ChatMessage>(`/chat/conversations/${conversationId}/messages`, { text });
    return data;
  },
};
