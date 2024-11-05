import { NestFactory } from '@nestjs/core';
import { BookingServiceModule } from './booking-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(BookingServiceModule);

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL],
        queue: 'booking-service',
        queueOptions: {
          durable: true,
        },
      },
    },
    { inheritAppConfig: true },
  );

  await app.startAllMicroservices();

  await app.listen(3000);
}
bootstrap();
