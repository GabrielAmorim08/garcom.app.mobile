import type { IsoDateTime } from '../../shared/types/common';

export interface ChatConversation {
  id: string;
  jobPostId: string;
  jobReferenceCode: string;
  jobTitle: string;
  otherUserId: string;
  otherUserName: string;
  otherUserPhotoPath: string | null;
  lastMessageAt: IsoDateTime | null;
  lastMessagePreview: string | null;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderUserId: string;
  text: string;
  createdAt: IsoDateTime;
  readAt: IsoDateTime | null;
}

export interface OpenConversationRequest {
  jobPostId: string;
  waiterUserId: string;
}
