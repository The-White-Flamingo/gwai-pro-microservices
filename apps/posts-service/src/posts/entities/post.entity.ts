import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Comment } from './comment.entity';
import { Like } from './like.entity';
import { Report } from './report.entity';

export enum FeedPostType {
  TEXT = 'TEXT',
  MEDIA = 'MEDIA',
  MEDIA_WITH_CAPTION = 'MEDIA_WITH_CAPTION',
}

@Entity('feeds')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'media_url', type: 'text', nullable: true })
  mediaUrl?: string | null;

  @Column({ type: 'text', nullable: true })
  caption?: string | null;

  @Column({
    type: 'enum',
    enum: FeedPostType,
  })
  type: FeedPostType;

  @Column({ name: 'likes_count', default: 0 })
  likesCount: number;

  @Column({ name: 'comments_count', default: 0 })
  commentsCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.post)
  likes: Like[];

  @OneToMany(() => Report, (report) => report.post)
  reports: Report[];
}
