import { Module } from '@nestjs/common';
import { PostsServiceController } from './app.controller';
import { PostsServiceService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './health/health.module';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/posts-service/.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: +process.env.POSTGRES_PORT,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      autoLoadEntities: true,
      synchronize: true,
      ssl:
        process.env.NODE_ENV === 'production'
          ? {
              rejectUnauthorized: false,
              ca: Buffer.from(process.env.SSL_CERT, 'base64').toString('utf-8'),
            }
          : false,
      retryAttempts: 30,
      retryDelay: 5000,
      logging: true,
    }),
    PostsModule,
    HealthModule,
  ],
  controllers: [PostsServiceController],
  providers: [PostsServiceService],
})
export class PostsServiceModule {}
