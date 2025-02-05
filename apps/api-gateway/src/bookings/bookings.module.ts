import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BOOKING_SERVICE } from '@app/shared';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: BOOKING_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL],
          queue: 'booking-service',
          queueOptions: {
            durable: true,
          },
          socketOptions: {
            noDelay: true,
            rejectUnauthorized: false,
            secureProtocol: 'TLSv1_2_method',
          }
        },
      },
    ]),
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
