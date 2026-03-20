import { Module } from '@nestjs/common';
import { StudiosService } from './studios.service';
import { StudiosController } from './studios.controller';
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
  controllers: [StudiosController],
  providers: [StudiosService],
})
export class StudiosModule {}
