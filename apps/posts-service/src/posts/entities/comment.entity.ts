import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from './post.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'feed_id' })
  feedId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'parent_id', nullable: true })
  parentId?: string | null;

  @Column()
  body: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'feed_id' })
  post: Post;

  @ManyToOne(() => Comment, (comment) => comment.replies, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'parent_id' })
  parent: Comment;

  @OneToMany(() => Comment, (comment) => comment.parent)
  replies: Comment[];
}
