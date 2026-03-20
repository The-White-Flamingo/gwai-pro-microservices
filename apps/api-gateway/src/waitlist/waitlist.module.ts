import { Module } from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import { WaitlistController } from './waitlist.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { WAITLIST_SERVICE } from '@app/shared';

@Module({
  imports: [
     ClientsModule.register([
          {
            name: WAITLIST_SERVICE,
            transport: Transport.RMQ,
            options: {
              urls: [process.env.RABBITMQ_URL],
              queue: 'waitlist-service',
              queueOptions: {
                durable: true,
              },
            },
          },
        ]),
  ],
  controllers: [WaitlistController],
  providers: [WaitlistService],
})
export class WaitlistModule {}
