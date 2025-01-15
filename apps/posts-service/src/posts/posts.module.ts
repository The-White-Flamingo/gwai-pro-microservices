import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Post } from './entities/post.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Comment]),
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
