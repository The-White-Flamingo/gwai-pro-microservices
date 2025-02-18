import { Module } from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import { WaitlistController } from './waitlist.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Waitlist } from './entities/waitlist.entity';
import { MAILING_SERVICE } from '@app/shared';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    TypeOrmModule.forFeature([Waitlist]),
    ClientsModule.register([
      {
        name: MAILING_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL],
          queue: 'mailing-service',
          queueOptions: {
            durable: true,
          },
          socketOptions: {
            noDelay: true,
            rejectUnauthorized: false,
            secureProtocol: 'TLSv1_2_method',
          },
        },
      },
    ]),
  ],
  controllers: [WaitlistController],
  providers: [WaitlistService],
})
export class WaitlistModule { }
