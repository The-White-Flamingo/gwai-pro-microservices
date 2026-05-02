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

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  dateOfBirth: Date;

  @Column({ nullable: true })
  address: string;

  @Column('simple-array', { nullable: true })
  interests: string[];

  @Column('simple-array', { nullable: true })
  genres: string[];

  @Column({ nullable: true })
  profilePicturePath: string;

  @Column({ nullable: true })
  coverVideoPath: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}
