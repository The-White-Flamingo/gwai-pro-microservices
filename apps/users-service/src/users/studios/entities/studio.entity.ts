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

@Entity('studios')
export class Studio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  rate: string;

  @Column('simple-array', { nullable: true })
  services: string[];

  @Column('simple-array', { nullable: true })
  equipment: string[];

  @Column({ nullable: true })
  profilePicturePath: string;

  @Column({ nullable: true })
  coverVideoPath: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ nullable: true })
  paymentMethodType: string;

  @Column({ nullable: true })
  bankName: string;

  @Column({ nullable: true })
  bankAccountNumber: string;

  @Column({ nullable: true })
  bankAccountName: string;

  @Column({ nullable: true })
  mobileMoneyNetworkProvider: string;

  @Column({ nullable: true })
  mobileMoneyPhoneNumber: string;

  @Column({ nullable: true })
  mobileMoneyAccountName: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}
