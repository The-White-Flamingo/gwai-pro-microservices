import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { USERS_SERVICE } from '@app/shared';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: USERS_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL],
          queue: 'users-service',
        },
      },
    ]),
    AuthModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule { }
