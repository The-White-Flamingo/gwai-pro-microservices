import { Module } from '@nestjs/common';
import { PostsServiceController } from './app.controller';
import { PostsServiceService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: +process.env.POSTGRES_PORT,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      autoLoadEntities: true,
      synchronize: true,
    }),
    PostsModule,
  ],
  controllers: [PostsServiceController],
  providers: [PostsServiceService],
})
export class PostsServiceModule {}
