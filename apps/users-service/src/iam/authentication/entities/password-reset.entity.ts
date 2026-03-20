import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('password_resets')
export class PasswordReset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  otpHash: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  blockedUntil?: Date;

  @Column({ type: 'timestamp', nullable: true })
  requestWindowStartedAt?: Date;

  @Column({ default: 0 })
  requestCount: number;

  @Column({ default: 0 })
  verifyAttempts: number;

  @Column({ type: 'timestamp', nullable: true })
  lastSentAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
