import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  ChatType,
  UserRole,
} from './enums/chat.enums';
import { Conversation } from '../entities/conversation.entity';
import { Message, MessageStatus } from '../entities/message.entity';
import {
  CreateClientChatDto,
  CreateMusicianChatDto,
  SendMessageDto,
  GetMessagesDto,
  GetConversationsDto,
  MarkReadDto,
} from '../dto/chat.dto';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepo: Repository<Conversation>,

    @InjectRepository(Message)
    private messageRepo: Repository<Message>,

    // Inject booking-service client to verify bookings
    @Inject('BOOKING_SERVICE')
    private bookingClient: ClientProxy,

    // Inject users-service client to verify connections
    @Inject('USERS_SERVICE')
    private usersClient: ClientProxy,
  ) {}

  // ─── CLIENT CHAT (with Musician or Studio) ────────────────────────────────

  /**
   * A client starts a chat AFTER their booking has been accepted.
   *
   * Rules:
   * 1. Requester MUST be a client
   * 2. Recipient MUST be musician or studio
   * 3. A ACCEPTED booking MUST exist between them
   * 4. If conversation already exists for this booking, return it
   */
  async createClientChat(dto: CreateClientChatDto): Promise<Conversation> {
    // Rule 1 & 2: Validate roles
    if (dto.chatType === ChatType.CLIENT_MUSICIAN &&
        dto.recipientRole !== UserRole.MUSICIAN) {
      throw new BadRequestException(
        'Chat type CLIENT_MUSICIAN requires recipient to be a musician',
      );
    }

    if (dto.chatType === ChatType.CLIENT_STUDIO &&
        dto.recipientRole !== UserRole.STUDIO) {
      throw new BadRequestException(
        'Chat type CLIENT_STUDIO requires recipient to be a studio',
      );
    }

    // Rule 3: Verify the booking exists AND is accepted
    const bookingVerified = await this.verifyAcceptedBooking(
      dto.bookingId,
      dto.clientId,
      dto.recipientId,
    );

    if (!bookingVerified) {
      throw new ForbiddenException(
        'Chat is only available after your booking has been accepted',
      );
    }

    // Rule 4: Check if conversation already exists for this booking
    const existing = await this.conversationRepo.findOne({
      where: { bookingId: dto.bookingId },
    });

    if (existing) return existing;

    // Create conversation
    const conversation = this.conversationRepo.create({
      chatType: dto.chatType,
      participantOneId: dto.clientId,
      participantOneRole: UserRole.CLIENT,
      participantTwoId: dto.recipientId,
      participantTwoRole: dto.recipientRole,
      bookingId: dto.bookingId,
      participantOneUnread: 0,
      participantTwoUnread: 0,
    });

    return this.conversationRepo.save(conversation);
  }

  /**
   * A musician starts a chat with another musician AFTER they have connected.
   *
   * Rules:
   * 1. Both participants MUST be musicians
   * 2. An ACCEPTED connection MUST exist between them
   * 3. If conversation already exists for this connection, return it
   */
  async createMusicianChat(dto: CreateMusicianChatDto): Promise<Conversation> {
    // Rule 1: Both must be musicians (verified by the controller via JWT role)

    // Rule 2: Verify connection exists and is accepted
    const connectionVerified = await this.verifyMusicianConnection(
      dto.connectionId,
      dto.musicianOneId,
      dto.musicianTwoId,
    );

    if (!connectionVerified) {
      throw new ForbiddenException(
        'Chat is only available after you and the other musician have connected',
      );
    }

    // Rule 3: Return existing conversation if already created for this connection
    const existing = await this.conversationRepo.findOne({
      where: { connectionId: dto.connectionId },
    });

    if (existing) return existing;

    // Create conversation
    const conversation = this.conversationRepo.create({
      chatType: ChatType.MUSICIAN_MUSICIAN,
      participantOneId: dto.musicianOneId,
      participantOneRole: UserRole.MUSICIAN,
      participantTwoId: dto.musicianTwoId,
      participantTwoRole: UserRole.MUSICIAN,
      connectionId: dto.connectionId,
      participantOneUnread: 0,
      participantTwoUnread: 0,
    });

    return this.conversationRepo.save(conversation);
  }

  // ─── GET CONVERSATIONS ────────────────────────────────────────────────────

  /**
   * Get all conversations for a user.
   * Works for all roles - client, musician, studio.
   */
  async getConversations(dto: GetConversationsDto) {
    const { userId, page = 1, limit = 20 } = dto;
    const skip = (page - 1) * limit;

    const [conversations, total] = await this.conversationRepo
      .createQueryBuilder('conv')
      .where(
        'conv.participantOneId = :userId OR conv.participantTwoId = :userId',
        { userId },
      )
      .orderBy('conv.lastMessageAt', 'DESC', 'NULLS LAST')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: conversations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getConversationById(id: string): Promise<Conversation> {
    const conversation = await this.conversationRepo.findOne({ where: { id } });

    if (!conversation) {
      throw new NotFoundException(`Conversation #${id} not found`);
    }

    return conversation;
  }

  // ─── MESSAGES ─────────────────────────────────────────────────────────────

  /**
   * Send a message.
   * Validates sender is a participant in the conversation.
   */
  async sendMessage(dto: SendMessageDto): Promise<Message> {
    const conversation = await this.getConversationById(dto.conversationId);

    // Validate sender is a participant
    const isParticipantOne = conversation.participantOneId === dto.senderId;
    const isParticipantTwo = conversation.participantTwoId === dto.senderId;

    if (!isParticipantOne && !isParticipantTwo) {
      throw new ForbiddenException(
        'You are not a participant in this conversation',
      );
    }

    // Save message
    const message = this.messageRepo.create({
      conversationId: dto.conversationId,
      senderId: dto.senderId,
      senderRole: dto.senderRole,
      content: dto.content,
      status: MessageStatus.SENT,
    });

    const savedMessage = await this.messageRepo.save(message);

    // Update last message + increment recipient unread count
    if (isParticipantOne) {
      await this.conversationRepo.update(dto.conversationId, {
        lastMessage: dto.content,
        lastMessageAt: new Date(),
        lastMessageSenderId: dto.senderId,
        participantTwoUnread: () => '"participantTwoUnread" + 1',
      });
    } else {
      await this.conversationRepo.update(dto.conversationId, {
        lastMessage: dto.content,
        lastMessageAt: new Date(),
        lastMessageSenderId: dto.senderId,
        participantOneUnread: () => '"participantOneUnread" + 1',
      });
    }

    return savedMessage;
  }

  async getMessages(dto: GetMessagesDto) {
    const { conversationId, page = 1, limit = 50 } = dto;
    const skip = (page - 1) * limit;

    await this.getConversationById(conversationId); // Verify exists

    const [messages, total] = await this.messageRepo.findAndCount({
      where: { conversationId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: messages.reverse(), // Chronological order
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Mark all unread messages as read for a user.
   * Resets their unread counter to 0.
   */
  async markAsRead(dto: MarkReadDto): Promise<void> {
    const conversation = await this.getConversationById(dto.conversationId);

    const isParticipantOne = conversation.participantOneId === dto.userId;
    const isParticipantTwo = conversation.participantTwoId === dto.userId;

    if (!isParticipantOne && !isParticipantTwo) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    // Mark messages sent by the OTHER person as read
    await this.messageRepo
      .createQueryBuilder()
      .update(Message)
      .set({ status: MessageStatus.READ, readAt: new Date() })
      .where('conversationId = :conversationId', { conversationId: dto.conversationId })
      .andWhere('senderId != :userId', { userId: dto.userId })
      .andWhere('status = :status', { status: MessageStatus.SENT })
      .execute();

    // Reset unread count
    const resetField = isParticipantOne
      ? { participantOneUnread: 0 }
      : { participantTwoUnread: 0 };

    await this.conversationRepo.update(dto.conversationId, resetField);
  }

  /**
   * Get total unread count for a user across all their conversations
   */
  async getUnreadCount(userId: string) {
    const conversations = await this.conversationRepo
      .createQueryBuilder('conv')
      .where(
        'conv.participantOneId = :userId OR conv.participantTwoId = :userId',
        { userId },
      )
      .getMany();

    const byConversation = conversations
      .map((conv) => ({
        conversationId: conv.id,
        chatType: conv.chatType,
        count:
          conv.participantOneId === userId
            ? conv.participantOneUnread
            : conv.participantTwoUnread,
      }))
      .filter((item) => item.count > 0);

    const total = byConversation.reduce((sum, item) => sum + item.count, 0);

    return { total, conversations: byConversation };
  }

  // ─── PRIVATE: VERIFICATION HELPERS ───────────────────────────────────────

  /**
   * Ask booking-service to verify the booking exists,
   * belongs to this client + recipient, and is ACCEPTED.
   */
  private async verifyAcceptedBooking(
    bookingId: string,
    clientId: string,
    recipientId: string,
  ): Promise<boolean> {
    try {
      const result = await firstValueFrom(
        this.bookingClient.send('verify_booking_for_chat', {
          bookingId,
          clientId,
          recipientId,
        }),
      );
      return result?.isAccepted === true;
    } catch {
      return false;
    }
  }

  /**
   * Ask users-service to verify the connection exists
   * between two musicians and is ACCEPTED.
   */
  private async verifyMusicianConnection(
    connectionId: string,
    musicianOneId: string,
    musicianTwoId: string,
  ): Promise<boolean> {
    try {
      const result = await firstValueFrom(
        this.usersClient.send('verify_musician_connection', {
          connectionId,
          musicianOneId,
          musicianTwoId,
        }),
      );
      return result?.isAccepted === true;
    } catch {
      return false;
    }
  }
}
