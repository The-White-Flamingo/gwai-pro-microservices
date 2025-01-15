import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Post } from "./post.entity";

@Entity('comments')
export class Comment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    body: string;

    @ManyToOne(() => Post, post => post.comments)
    post: Post;

    @ManyToOne(() => Comment, comment => comment.replies)
    parent: Comment;

    @OneToMany(() => Comment, comment => comment.parent)
    replies: Comment[];
}
