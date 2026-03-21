import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  Request,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { ChatType, UserRole } from './dto/chat-gateway.dto';

@ApiTags('Chat')
@ApiBearerAuth()
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // ─── CREATE CONVERSATIONS ─────────────────────────────────────────────────

  /**
   * CLIENT starts a chat with a musician or studio after booking is accepted.
   *
   * POST /chat/conversations/booking
   * Body: { recipientId, bookingId }
   *
   * - Only clients can call this endpoint
   * - bookingId must be an accepted booking
   */
  @Post('conversations/booking')
  @ApiOperation({ summary: 'Client starts chat after booking is accepted' })
  async createClientChat(
    @Request() req,
    @Body() body: { recipientId: string; recipientRole: UserRole; bookingId: string },
  ) {
    // Enforce: only clients can start booking chats
    if (req.user.role !== UserRole.CLIENT) {
      throw new ForbiddenException(
        'Only clients can start a chat from a booking',
      );
    }

    // Determine chat type based on recipient role
    let chatType: ChatType;
    if (body.recipientRole === UserRole.MUSICIAN) {
      chatType = ChatType.CLIENT_MUSICIAN;
    } else if (body.recipientRole === UserRole.STUDIO) {
      chatType = ChatType.CLIENT_STUDIO;
    } else {
      throw new BadRequestException(
        'Recipient must be a musician or studio',
      );
    }

    return this.chatService.createClientChat({
      chatType,
      clientId: req.user.sub,
      recipientId: body.recipientId,
      recipientRole: body.recipientRole,
      bookingId: body.bookingId,
    });
  }

  /**
   * MUSICIAN starts a chat with another musician after they have connected.
   *
   * POST /chat/conversations/musician
   * Body: { otherMusicianId, connectionId }
   *
   * - Only musicians can call this endpoint
   * - connectionId must be an accepted connection
   */
  @Post('conversations/musician')
  @ApiOperation({ summary: 'Musician starts chat with another musician after connecting' })
  async createMusicianChat(
    @Request() req,
    @Body() body: { otherMusicianId: string; connectionId: string },
  ) {
    // Enforce: only musicians can start musician-to-musician chats
    if (req.user.role !== UserRole.MUSICIAN) {
      throw new ForbiddenException(
        'Only musicians can start musician-to-musician chats',
      );
    }

    return this.chatService.createMusicianChat({
      musicianOneId: req.user.sub,
      musicianTwoId: body.otherMusicianId,
      connectionId: body.connectionId,
    });
  }

  // ─── GET CONVERSATIONS ────────────────────────────────────────────────────

  /**
   * Get all conversations for the logged-in user.
   * Works for all roles (client, musician, studio).
   *
   * GET /chat/conversations?page=1&limit=20
   */
  @Get('conversations')
  @ApiOperation({ summary: 'Get my conversations' })
  async getConversations(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.chatService.getConversations({
      userId: req.user.sub,
      role: req.user.role,
      page: +page,
      limit: +limit,
    });
  }

  /**
   * GET /chat/conversations/:id
   */
  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get a specific conversation' })
  async getConversation(@Param('id') id: string) {
    return this.chatService.getConversation(id);
  }

  // ─── MESSAGES ─────────────────────────────────────────────────────────────

  /**
   * Send a message (REST alternative to WebSocket).
   *
   * POST /chat/conversations/:conversationId/messages
   * Body: { content: string }
   */
  @Post('conversations/:conversationId/messages')
  @ApiOperation({ summary: 'Send a message' })
  async sendMessage(
    @Request() req,
    @Param('conversationId') conversationId: string,
    @Body() body: { content: string },
  ) {
    return this.chatService.sendMessage({
      conversationId,
      senderId: req.user.sub,
      senderRole: req.user.role,
      content: body.content,
    });
  }

  /**
   * Get messages (paginated).
   *
   * GET /chat/conversations/:conversationId/messages?page=1&limit=50
   */
  @Get('conversations/:conversationId/messages')
  @ApiOperation({ summary: 'Get messages in a conversation' })
  async getMessages(
    @Param('conversationId') conversationId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    return this.chatService.getMessages({
      conversationId,
      page: +page,
      limit: +limit,
    });
  }

  /**
   * Mark all messages as read.
   *
   * PATCH /chat/conversations/:conversationId/read
   */
  @Patch('conversations/:conversationId/read')
  @ApiOperation({ summary: 'Mark all messages as read' })
  async markAsRead(
    @Request() req,
    @Param('conversationId') conversationId: string,
  ) {
    return this.chatService.markMessagesRead({
      conversationId,
      userId: req.user.sub,
    });
  }

  /**
   * Get total unread count across all conversations.
   *
   * GET /chat/unread
   */
  @Get('unread')
  @ApiOperation({ summary: 'Get total unread message count' })
  async getUnreadCount(@Request() req) {
    return this.chatService.getUnreadCount(req.user.sub);
  }
}
