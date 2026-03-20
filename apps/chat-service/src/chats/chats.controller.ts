import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ChatsService } from './chats.service';
import {
  CreateClientChatDto,
  CreateMusicianChatDto,
  SendMessageDto,
  GetMessagesDto,
  GetConversationsDto,
  MarkReadDto,
} from '../dto/chat.dto';
import { UserRole } from './enums/chat.enums';

@Controller()
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  // ─── CREATE CONVERSATIONS ─────────────────────────────────────────────────

  /**
   * Called by API Gateway when a CLIENT starts a chat
   * after their booking is accepted.
   *
   * Validates:
   * - Sender is a client
   * - Recipient is musician or studio
   * - Booking exists and is accepted
   */
  @MessagePattern('create_client_chat')
  async createClientChat(@Payload() dto: CreateClientChatDto) {
    try {
      const data = await this.chatsService.createClientChat(dto);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Called by API Gateway when a MUSICIAN starts a chat
   * with another musician after they have connected.
   *
   * Validates:
   * - Both are musicians
   * - Connection exists and is accepted
   */
  @MessagePattern('create_musician_chat')
  async createMusicianChat(@Payload() dto: CreateMusicianChatDto) {
    try {
      const data = await this.chatsService.createMusicianChat(dto);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ─── GET CONVERSATIONS ────────────────────────────────────────────────────

  @MessagePattern('get_conversations')
  async getConversations(@Payload() dto: GetConversationsDto) {
    try {
      const data = await this.chatsService.getConversations(dto);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @MessagePattern('get_conversation')
  async getConversation(@Payload() payload: { id: string }) {
    try {
      const data = await this.chatsService.getConversationById(payload.id);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ─── MESSAGES ─────────────────────────────────────────────────────────────

  @MessagePattern('send_message')
  async sendMessage(@Payload() dto: SendMessageDto) {
    try {
      const data = await this.chatsService.sendMessage(dto);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @MessagePattern('get_messages')
  async getMessages(@Payload() dto: GetMessagesDto) {
    try {
      const data = await this.chatsService.getMessages(dto);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @MessagePattern('mark_messages_read')
  async markMessagesRead(@Payload() dto: MarkReadDto) {
    try {
      await this.chatsService.markAsRead(dto);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @MessagePattern('get_unread_count')
  async getUnreadCount(@Payload() payload: { userId: string }) {
    try {
      const data = await this.chatsService.getUnreadCount(payload.userId);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
