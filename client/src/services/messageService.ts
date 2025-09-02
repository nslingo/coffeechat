import { apiClient } from '../lib/api-client';

// Message API types
export interface Message {
  id: string;
  content: string;
  senderId: string;
  recipientId: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    image?: string;
  };
}

export interface Conversation {
  partnerId: string;
  partnerName: string;
  partnerProfilePicture?: string;
  lastMessage: {
    content: string;
    createdAt: string;
    senderId: string;
  };
}

export interface ConversationResponse {
  messages: Message[];
  otherUser: {
    id: string;
    name: string;
    image?: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Message API functions
export const messageService = {
  // Send a message
  sendMessage: async (recipientId: string, content: string): Promise<Message> => {
    const response = await apiClient.post<{ data: Message }>('/api/messages', {
      recipientId,
      content
    });
    return response.data.data;
  },

  // Get all conversations
  getConversations: async (): Promise<Conversation[]> => {
    const response = await apiClient.get<{ data: { conversations: Conversation[] } }>('/api/messages/conversations');
    return response.data.data.conversations;
  },

  // Get messages for a specific conversation
  getConversation: async (userId: string, page: number = 1, limit: number = 50): Promise<ConversationResponse> => {
    const response = await apiClient.get<{ data: ConversationResponse }>(`/api/messages/conversations/${userId}?page=${page}&limit=${limit}`);
    return response.data.data;
  }
};