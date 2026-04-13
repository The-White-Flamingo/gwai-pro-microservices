// apps/api-gateway/src/users/admins/admins.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { USERS_SERVICE } from '@app/shared';
import { AdminsService } from './admins.service';
import { AdminsController } from './admins.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: USERS_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL],
          queue: 'users-service',
          queueOptions: { durable: true },
        },
      },
    ]),
    MulterModule.register({ storage: memoryStorage() }),
  ],
  controllers: [AdminsController],
  providers: [AdminsService],
})
export class AdminsModule {}
// import { Module } from '@nestjs/common';
// import { AdminsService } from './admins.service';
// import { AdminsController } from './admins.controller';
// import { USERS_SERVICE } from '@app/shared';
// import { ClientsModule as NestClientsModule, Transport } from '@nestjs/microservices';

// @Module({
//   imports: [
//     NestClientsModule.register([
//       {
//         name: USERS_SERVICE,
//         transport: Transport.RMQ,
//         options: {
//           urls: [process.env.RABBITMQ_URL],
//           queue: 'users-service',
//           queueOptions: {
//             durable: true,
//           },
//         },
//       },
//     ]),
//   ],
//   controllers: [AdminsController],
//   providers: [AdminsService],
// })
// export class AdminsModule {}
