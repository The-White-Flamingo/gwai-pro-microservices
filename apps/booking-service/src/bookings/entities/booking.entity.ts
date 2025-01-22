import { BookingStatus } from '@app/bookings';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  serviceType: string;

  @Column()
  date: Date;

  @Column('time')
  startTime: string;

  @Column('time')
  endTime: string;

  @Column('enum', { enum: BookingStatus, default: BookingStatus.Requested })
  status: BookingStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updateAt: Date;
}
