import { ChatType, UserRole } from '../chats/enums/chat.enums';

// ─── CREATE CONVERSATION ──────────────────────────────────────────────────────

/**
 * Used when a CLIENT starts a chat after their booking is accepted.
 * Chat-service will verify the booking exists and is accepted
 * before allowing the conversation to be created.
 */
export class CreateClientChatDto {
  chatType: ChatType.CLIENT_MUSICIAN | ChatType.CLIENT_STUDIO;
  clientId: string;
  recipientId: string;     // musicianId or studioId
  recipientRole: UserRole.MUSICIAN | UserRole.STUDIO;
  bookingId: string;       // REQUIRED - must be an accepted booking
}

/**
 * Used when a MUSICIAN starts a chat with another musician.
 * Chat-service will verify a connection exists between them
 * before allowing the conversation to be created.
 */
export class CreateMusicianChatDto {
  musicianOneId: string;
  musicianTwoId: string;
  connectionId: string;    // REQUIRED - must be an accepted connection
}

// ─── MESSAGES ─────────────────────────────────────────────────────────────────

export class SendMessageDto {
  conversationId: string;
  senderId: string;
  senderRole: UserRole;
  content: string;
}

export class GetMessagesDto {
  conversationId: string;
  page?: number;
  limit?: number;
}

// ─── CONVERSATIONS ────────────────────────────────────────────────────────────

export class GetConversationsDto {
  userId: string;
  role: UserRole;
  page?: number;
  limit?: number;
}

export class MarkReadDto {
  conversationId: string;
  userId: string;
}

// ─── BOOKING VERIFICATION ─────────────────────────────────────────────────────
// Payload received from booking-service to verify a booking

export class VerifyBookingDto {
  bookingId: string;
  clientId: string;
  recipientId: string;   // musicianId or studioId
}

// ─── CONNECTION VERIFICATION ──────────────────────────────────────────────────
// Payload received from users-service to verify a musician connection

export class VerifyConnectionDto {
  connectionId: string;
  musicianOneId: string;
  musicianTwoId: string;
}
