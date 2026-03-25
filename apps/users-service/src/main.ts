import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import {seedAdmin} from './database/seeds/admin.seed';
// datasource
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.RMQ,
      options: {
        urls: [
          process.env.RABBITMQ_URL
        ],
        queue: 'users-service',
        queueOptions: {
          durable: true,
        },
        // socketOptions: {
        //   noDelay: true,
        //   rejectUnauthorized: false,
        //   secureProtocol: 'TLSv1_2_method',
        // },
        prefetchCount: 5,
        noAck: false,
      },
    },
    { inheritAppConfig: true },
  );

  // initialize the app before accessing providers
  await app.init();

  // Run seed before accepting traffic
  const dataSource = app.get(DataSource); // get TypeORM DataSource instance
  await seedAdmin(dataSource);
  
  await app.startAllMicroservices();

  await app.listen(3000);
  // await new Promise(() => {});

}
bootstrap();

/**
 * async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const rmqOptions: any = {
    urls: [process.env.RABBITMQ_URL],
    queue: 'users-service',
    queueOptions: {
      durable: true,
    },
    prefetchCount: 5,
    noAck: false,
  };

  // Only add SSL options in production
  if (process.env.NODE_ENV === 'production') {
    rmqOptions.socketOptions = {
      noDelay: true,
      rejectUnauthorized: false,
      secureProtocol: 'TLSv1_2_method',
    };
  }

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.RMQ,
      options: rmqOptions,
    },
    { inheritAppConfig: true },
  );

  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
 */