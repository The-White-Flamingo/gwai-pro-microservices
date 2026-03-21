// apps/booking-service/src/bookings/entities/booking.entity.ts
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

  // The CLIENT who made the booking (User ID)
  @Column()
  userId: string;

  // The MUSICIAN or STUDIO being booked (Musician.id or Studio.id)
  @Column()
  providerId: string;

  // Type of provider: 'musician' or 'studio'
  @Column()
  providerType: string;

  // Type of service being booked (e.g., "Live Performance", "Recording Session")
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
