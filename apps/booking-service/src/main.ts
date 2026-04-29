import { NestFactory } from '@nestjs/core';
import { BookingServiceModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(BookingServiceModule);

  const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5675?frameMax=0';
  console.log('🔍 Using RabbitMQ URL:', rabbitmqUrl);

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL || rabbitmqUrl],
        queue: 'booking-service',
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
