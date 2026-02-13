// apps/users-service/src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IamModule } from './iam/iam.module';
import { RedisModule } from './redis/redis.module';
import { HealthModule } from './health/health.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/users-service/.env',
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
      logging: true,
    }),
    RedisModule.forRoot({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),  // ← Better parsing with fallback
      username: process.env.NODE_ENV === 'production' ? process.env.REDIS_USERNAME : undefined,
      useTLS: process.env.NODE_ENV === 'production' && process.env.REDIS_USE_TLS === 'true',
    }),
    // RedisModule.forRoot({
    //   host: process.env.REDIS_HOST,
    //   port: +process.env.REDIS_PORT,
    //   username: process.env.NODE_ENV === 'production' && process.env.REDIS_USERNAME,
    //   useTLS: process.env.NODE_ENV === 'production' && process.env.REDIS_USE_TLS === 'true',
    // }),
    UsersModule,
    IamModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
