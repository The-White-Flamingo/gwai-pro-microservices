import { Role } from '../../../users/enums/role.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sign_up_otps')
export class SignUpOtp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  otpHash: string;

  @Column()
  passwordHash: string;

  @Column('enum', { enum: Role })
  role: Role;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  blockedUntil?: Date;

  @Column({ type: 'timestamp', nullable: true })
  requestWindowStartedAt?: Date;

  @Column({ default: 0 })
  otpRequestCount: number;

  @Column({ default: 0 })
  verifyAttempts: number;

  @Column({ type: 'timestamp', nullable: true })
  lastSentAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
