import { NestFactory } from '@nestjs/core';
import { WaitlistServiceModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(WaitlistServiceModule);

  const rabbitmq = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5675?frameMax=0';


  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.RMQ,
      options: {
        urls: [rabbitmq],
        queue: 'waitlist-service',
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

  app.listen(3000);
}
bootstrap();
