import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Message } from './message.entity';
import { UserRole, ChatType } from '../chats/enums/chat.enums';


@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ChatType })
  chatType: ChatType;

  // ─── PARTICIPANT ONE ───────────────────────────────────────────────────────
  // For CLIENT_MUSICIAN / CLIENT_STUDIO → always the CLIENT
  // For MUSICIAN_MUSICIAN              → the musician who initiated

  @Column()
  participantOneId: string;

  @Column({ type: 'enum', enum: UserRole })
  participantOneRole: UserRole;

  // ─── PARTICIPANT TWO ───────────────────────────────────────────────────────
  // For CLIENT_MUSICIAN  → the MUSICIAN
  // For CLIENT_STUDIO    → the STUDIO
  // For MUSICIAN_MUSICIAN → the other MUSICIAN

  @Column()
  participantTwoId: string;

  @Column({ type: 'enum', enum: UserRole })
  participantTwoRole: UserRole;

  // ─── UNLOCK REFERENCES ────────────────────────────────────────────────────
  // The booking that unlocked this chat (CLIENT_MUSICIAN / CLIENT_STUDIO)
  @Column({ nullable: true })
  bookingId: string;

  // The connection that unlocked this chat (MUSICIAN_MUSICIAN)
  @Column({ nullable: true })
  connectionId: string;

  // ─── LAST MESSAGE PREVIEW ─────────────────────────────────────────────────
  @Column({ nullable: true })
  lastMessage: string;

  @Column({ nullable: true })
  lastMessageAt: Date;

  @Column({ nullable: true })
  lastMessageSenderId: string;

  // ─── UNREAD COUNTS ────────────────────────────────────────────────────────
  @Column({ default: 0 })
  participantOneUnread: number;

  @Column({ default: 0 })
  participantTwoUnread: number;

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
