// apps/blog-service/src/blog/entities/blog.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum BlogStatus {
  Draft = 'draft',
  Published = 'published',
}

@Entity('blog_posts')
export class Blog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  image: string; // stored URL after upload

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column('enum', { enum: BlogStatus, default: BlogStatus.Draft })
  status: BlogStatus;

  // Public display name — entered in the form
  @Column()
  authorName: string;

  // Admin's role label e.g. "Super Admin" — pulled from JWT
  @Column()
  authorRole: string;

  // Admin's user id — pulled from JWT, stored for audit
  @Column()
  authorId: string;

  // Who last edited the post — updated on every PUT
  @Column({ nullable: true })
  lastEditedBy: string;

  // Only set when status first becomes "published"
  @Column({ nullable: true, type: 'timestamptz' })
  publishedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}