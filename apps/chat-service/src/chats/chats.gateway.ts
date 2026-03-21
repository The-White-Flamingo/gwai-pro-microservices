import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatsService } from './chats.service';
import { SendMessageDto, MarkReadDto } from '../dto/chat.dto';

@WebSocketGateway({
  cors: { origin: '*' }, // Restrict to your domain in production
  namespace: 'chat',
})
export class ChatsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // userId → socketId mapping
  private onlineUsers = new Map<string, string>();

  constructor(private readonly chatsService: ChatsService) {}

  // ─── CONNECTION ───────────────────────────────────────────────────────────

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    const role = client.handshake.query.role as string;

    if (!userId || !role) {
      client.disconnect();
      return;
    }

    this.onlineUsers.set(userId, client.id);
    client.data.userId = userId;
    client.data.role = role;

    // Tell this user who is online
    client.emit('online_users', Array.from(this.onlineUsers.keys()));

    // Tell others this user came online
    client.broadcast.emit('user_online', { userId, role });

    console.log(`✅ ${role} [${userId}] connected`);
  }

  handleDisconnect(client: Socket) {
    const { userId, role } = client.data;

    if (userId) {
      this.onlineUsers.delete(userId);
      this.server.emit('user_offline', { userId, role });
      console.log(`❌ ${role} [${userId}] disconnected`);
    }
  }

  // ─── EVENTS ───────────────────────────────────────────────────────────────

  /**
   * Join a conversation room.
   * Must be called before receiving messages for that conversation.
   */
  @SubscribeMessage('join_conversation')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    client.join(`conv:${data.conversationId}`);
    return { success: true };
  }

  /**
   * Send a message in real-time.
   * Saves to DB then emits to both participants.
   */
  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: SendMessageDto,
  ) {
    try {
      const message = await this.chatsService.sendMessage(dto);
      const conversation = await this.chatsService.getConversationById(
        dto.conversationId,
      );

      // Push new_message to BOTH participants
      const participants = [
        conversation.participantOneId,
        conversation.participantTwoId,
      ];

      participants.forEach((participantId) => {
        const socketId = this.onlineUsers.get(participantId);
        if (socketId) {
          this.server.to(socketId).emit('new_message', {
            message,
            conversationId: dto.conversationId,
          });
        }
      });

      return { success: true, message };
    } catch (error) {
      client.emit('chat_error', { message: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Mark messages as read.
   * Notifies the other participant their messages were read.
   */
  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: MarkReadDto,
  ) {
    try {
      await this.chatsService.markAsRead(dto);

      const conversation = await this.chatsService.getConversationById(
        dto.conversationId,
      );

      // Tell the OTHER participant their messages were read
      const otherUserId =
        conversation.participantOneId === dto.userId
          ? conversation.participantTwoId
          : conversation.participantOneId;

      const otherSocketId = this.onlineUsers.get(otherUserId);
      if (otherSocketId) {
        this.server.to(otherSocketId).emit('messages_read', {
          conversationId: dto.conversationId,
          readBy: dto.userId,
        });
      }

      return { success: true };
    } catch (error) {
      client.emit('chat_error', { message: error.message });
      return { success: false, error: error.message };
    }
  }

  // ─── HELPERS ──────────────────────────────────────────────────────────────

  emitToUser(userId: string, event: string, data: any) {
    const socketId = this.onlineUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
    }
  }
}
