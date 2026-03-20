import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
// import { UserRole, ChatType } from './dto/chat-gateway.dto';
import { UserRole, ChatType } from './dto/chat-gateway.dto';

@Injectable()
export class ChatService {
  constructor(
    @Inject('CHAT_SERVICE')
    private readonly chatClient: ClientProxy,
  ) {}

  // ─── CREATE CONVERSATIONS ─────────────────────────────────────────────────

  async createClientChat(data: {
    chatType: ChatType;
    clientId: string;
    recipientId: string;
    recipientRole: UserRole;
    bookingId: string;
  }) {
    return firstValueFrom(
      this.chatClient.send('create_client_chat', data),
    );
  }

  async createMusicianChat(data: {
    musicianOneId: string;
    musicianTwoId: string;
    connectionId: string;
  }) {
    return firstValueFrom(
      this.chatClient.send('create_musician_chat', data),
    );
  }

  // ─── CONVERSATIONS ────────────────────────────────────────────────────────

  async getConversations(data: {
    userId: string;
    role: UserRole;
    page: number;
    limit: number;
  }) {
    return firstValueFrom(
      this.chatClient.send('get_conversations', data),
    );
  }

  async getConversation(id: string) {
    return firstValueFrom(
      this.chatClient.send('get_conversation', { id }),
    );
  }

  // ─── MESSAGES ─────────────────────────────────────────────────────────────

  async sendMessage(data: {
    conversationId: string;
    senderId: string;
    senderRole: UserRole;
    content: string;
  }) {
    return firstValueFrom(
      this.chatClient.send('send_message', data),
    );
  }

  async getMessages(data: {
    conversationId: string;
    page: number;
    limit: number;
  }) {
    return firstValueFrom(
      this.chatClient.send('get_messages', data),
    );
  }

  async markMessagesRead(data: {
    conversationId: string;
    userId: string;
  }) {
    return firstValueFrom(
      this.chatClient.send('mark_messages_read', data),
    );
  }

  async getUnreadCount(userId: string) {
    return firstValueFrom(
      this.chatClient.send('get_unread_count', { userId }),
    );
  }
}
