import { NestFactory } from '@nestjs/core';
import { PostsServiceModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(PostsServiceModule);

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL],
        queue: 'posts-service',
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
