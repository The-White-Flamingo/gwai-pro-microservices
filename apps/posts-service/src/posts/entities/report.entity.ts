import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Post } from './post.entity';

@Entity('post_reports')
@Unique(['userId', 'feedId'])
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'feed_id' })
  feedId: string;

  @Column({ type: 'text', nullable: true })
  reason?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Post, (post) => post.reports, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'feed_id' })
  post: Post;
}
