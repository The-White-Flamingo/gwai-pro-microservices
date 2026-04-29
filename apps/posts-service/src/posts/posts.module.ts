import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { USERS_SERVICE } from '@app/shared';
import { Comment } from './entities/comment.entity';
import { Follow } from './entities/follow.entity';
import { Like } from './entities/like.entity';
import { Post } from './entities/post.entity';
import { Report } from './entities/report.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Comment, Like, Follow, Report]),
    ClientsModule.register([
      {
        name: USERS_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL],
          queue: 'users-service',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
