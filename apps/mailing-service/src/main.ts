import { NestFactory } from '@nestjs/core';
import { MailingServiceModule } from './mailing-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(MailingServiceModule);

  const rabbitmq = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5675?frameMax=0';
  app.connectMicroservice<MicroserviceOptions>(
      {
        transport: Transport.RMQ,
        options: {
          urls: [rabbitmq],
          queue: 'mailing-service',
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
