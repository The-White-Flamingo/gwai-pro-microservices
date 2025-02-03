import { Module } from '@nestjs/common';
import { BookingServiceController } from './app.controller';
import { BookingServiceService } from './app.service';
import { BookingsModule } from './bookings/bookings.module';
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
    BookingsModule,
    HealthModule,
  ],
  controllers: [BookingServiceController],
  providers: [BookingServiceService],
})
export class BookingServiceModule {}
