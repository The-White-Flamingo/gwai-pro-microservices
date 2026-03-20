import { Module } from '@nestjs/common';
import { WaitlistServiceController } from './app.controller';
import { WaitlistServiceService } from './app.service';
import { WaitlistModule } from './waitlist/waitlist.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/waitlist-service/.env',
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
    WaitlistModule,
  ],
  controllers: [WaitlistServiceController],
  providers: [WaitlistServiceService],
})
export class WaitlistServiceModule {}
