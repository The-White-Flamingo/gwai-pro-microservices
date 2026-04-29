import {
  Column,
  Entity,
  JoinTable,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from '../enums/role.enum';
import { ApiKey } from '../api-keys/entities/api-key.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true, nullable: true })
  username: string;

  @Column({ unique: true, nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  password: string;

  @Column('enum', { enum: Role, default: Role.Pending })
  role: Role;

  @Column({ nullable: true })
  googleId: string;

  @Column({ nullable: true })
  appleId: string;

  @Column({ unique: true, nullable: true })
  firebaseUid: string;

  @JoinTable()
  @OneToMany(() => ApiKey, (apiKey) => apiKey.user)
  apiKeys: ApiKey[];

  // fields for password reset token and its expiration
  @Column({ nullable: true })
  passwordResetToken: string | null;

  @Column({ nullable: true, type: 'timestamptz' })
  passwordResetTokenExpiresAt: Date | null;

// is email verified field?
  @Column({ default: false })
  isEmailVerified: boolean;

  // fields for email verification token and its expiration
  @Column({ nullable: true })
  emailVerificationToken: string | null;

  // store the expiration time of the email verification token
  @Column({ nullable: true, type: 'timestamptz' })
  emailVerificationTokenExpiresAt: Date | null;
}
