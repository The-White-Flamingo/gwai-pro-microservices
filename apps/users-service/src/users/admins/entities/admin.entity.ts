// apps/users-service/src/users/admins/entities/admin.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../entities/user.entity';

@Entity('admins')
export class Admin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  contact: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  role: string;

  // ── New fields ─────────────────────────────────────────────

  @Column({ nullable: true })
  profilePhoto: string; // stored URL after upload

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  postalAddress: string;

  @Column({ default: true })
  inAppNotifications: boolean;

  @Column({ default: true })
  emailNotifications: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}

// import {
//   Column,
//   CreateDateColumn,
//   Entity,
//   JoinColumn,
//   OneToOne,
//   PrimaryGeneratedColumn,
//   UpdateDateColumn,
// } from 'typeorm';
// import { User } from '../../entities/user.entity';

// @Entity('admins')
// export class Admin {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   @Column({ nullable: true })
//   firstName: string;

//   @Column({ nullable: true })
//   lastName: string;

//   @Column({ nullable: true })
//   contact: string;

//   @Column({ nullable: true })
//   location: string;

//   @Column({ nullable: true })
//   role: string;

//   @CreateDateColumn()
//   createdAt: Date;

//   @UpdateDateColumn()
//   updatedAt: Date;

//   @OneToOne(() => User)
//   @JoinColumn()
//   user: User;
// }
