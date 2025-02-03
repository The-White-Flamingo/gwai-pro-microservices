import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IamModule } from './iam/iam.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    // ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: +process.env.POSTGRES_PORT,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      autoLoadEntities: true,
      synchronize: true,
      ssl: {
        rejectUnauthorized: false,
        ca: Buffer.from(process.env.SSL_CERT, 'base64').toString('utf-8'),
      }
    }),
    RedisModule.forRoot({
      host: process.env.REDIS_HOST,
      port: +process.env.REDIS_PORT,
    }),
    UsersModule,
    IamModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
