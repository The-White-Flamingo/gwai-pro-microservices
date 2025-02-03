import { Module } from '@nestjs/common';
import { ChatServiceController } from './app.controller';
import { ChatServiceService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './health/health.module';

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
      ssl: {
        rejectUnauthorized: false,
        ca: Buffer.from(process.env.SSL_CERT, 'base64').toString('utf-8'),
      },
    }),
    HealthModule,
  ],
  controllers: [ChatServiceController],
  providers: [ChatServiceService],
})
export class ChatServiceModule {}
