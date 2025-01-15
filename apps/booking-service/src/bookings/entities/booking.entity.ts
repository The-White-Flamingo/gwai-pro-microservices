import { BookingStatus, ServiceType } from '@app/bookings';
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

  @Column('enum')
  serviceType: ServiceType;

  @Column()
  date: Date;

  @Column('time')
  startTime: string;

  @Column('time')
  endTime: string;

  @Column('enum')
  status: BookingStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updateAt: Date;
}
