import { NestFactory } from '@nestjs/core';
import { ChatServiceModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(ChatServiceModule);

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL],
        queue: 'chat-service',
        queueOptions: {
          durable: true,
        },
        socketOptions: {
          noDelay: true,
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
