import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('system_settings')
export class SystemSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: '1 hour' })
  minimumBookingNotice: string;

  @Column({ default: '30 days' })
  maximumBookingWindow: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 20 })
  musicianCommissionRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 15 })
  studioCommissionRate: number;

  @Column({ default: '12 hours before session' })
  freeCancellationUntil: string;

  @Column({ default: '50' })
  refundPercentageAfter: string;

  @Column({ type: 'text', nullable: true })
  policyDescription: string;

  @Column({ default: true })
  bookingConfirmations: boolean;

  @Column({ default: true })
  bookingChanges: boolean;

  @Column({ default: true })
  payoutUpdates: boolean;

  @Column({ default: true })
  refundRequests: boolean;

  @Column({ default: true })
  paymentFailures: boolean;

  @Column({ default: true })
  adminNotesComments: boolean;

  @UpdateDateColumn()
  updatedAt: Date;
}
