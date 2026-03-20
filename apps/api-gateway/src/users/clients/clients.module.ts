import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { USERS_SERVICE } from '@app/shared';
import { ClientsModule as NestClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    NestClientsModule.register([
      {
        name: USERS_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL],
          queue: 'users-service',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [ClientsController],
  providers: [ClientsService],
})
export class ClientsModule {}
