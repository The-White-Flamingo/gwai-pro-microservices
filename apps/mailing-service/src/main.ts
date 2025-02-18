import { NestFactory } from '@nestjs/core';
import { MailingServiceModule } from './mailing-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(MailingServiceModule);

  app.connectMicroservice<MicroserviceOptions>(
      {
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL],
          queue: 'mailing-service',
          queueOptions: {
            durable: true,
          },
          socketOptions: {
            noDelay: true,
            rejectUnauthorized: false,
            secureProtocol: 'TLSv1_2_method',
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
