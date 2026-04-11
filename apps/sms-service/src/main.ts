import { NestFactory } from '@nestjs/core';
import { SmsServiceModule } from './sms-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(SmsServiceModule);

  const rabbitmq =
    process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5675?frameMax=0';

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.RMQ,
      options: {
        urls: [rabbitmq],
        queue: 'sms-service',
        queueOptions: {
          durable: true,
        },
        prefetchCount: 5,
        noAck: false,
      },
    },
    { inheritAppConfig: true },
  );

  await app.startAllMicroservices();

  await app.listen(3000);
}

bootstrap();
