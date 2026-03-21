import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

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