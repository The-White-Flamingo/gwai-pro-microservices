// apps/blog-service/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL],
        queue: 'blog-service',
        queueOptions: { durable: true },
        prefetchCount: 5,
        noAck: false,
      },
    },
  );

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Pure microservice — no port, just starts listening on RabbitMQ
  await app.listen();
  console.log('Blog Service is running and listening on RabbitMQ');
}
bootstrap();

// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { ValidationPipe } from '@nestjs/common';
// import { MicroserviceOptions, Transport } from '@nestjs/microservices';

// async function bootstrap() {
//   const app = await NestFactory.createMicroservice<MicroserviceOptions>(
//     AppModule,
//     {
//       transport: Transport.RMQ,
//       options: {
//         urls: [process.env.RABBITMQ_URL],
//         queue: 'blog-service',
//         queueOptions: { durable: true },
//         prefetchCount: 5,
//         noAck: false,
//       },
//     },
//   );

//   app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

//   await app.listen();

//   console.log('🚀 Blog Service is running (RMQ microservice)');
// }

// bootstrap();

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);

//   app.connectMicroservice<MicroserviceOptions>({
//     transport: Transport.RMQ,
//     options: {
//       urls: [process.env.RABBITMQ_URL],
//       queue: 'blog-service',
//       queueOptions: { durable: true },
//       prefetchCount: 5,
//       noAck: false,
//     },
//   });

//   app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

//   await app.startAllMicroservices();

//   const port = process.env.PORT || 3002;
//   await app.listen(port, '0.0.0.0');

//   console.log(`🚀 Blog Service HTTP running on port ${port}`);
// }
// bootstrap();
// // apps/blog-service/src/main.ts
// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { ValidationPipe } from '@nestjs/common';
// import { MicroserviceOptions, Transport } from '@nestjs/microservices';

// async function bootstrap() {
//   const app = await NestFactory.createMicroservice<MicroserviceOptions>(
//     AppModule,
//     {
//       transport: Transport.RMQ,
//       options: {
//         urls: [process.env.RABBITMQ_URL],
//         queue: 'blog-service',
//         queueOptions: { durable: true },
//         prefetchCount: 5,
//         noAck: false,
//       },
//     },
//   );

//   const port = process.env.PORT || 3002;
//   await app.listen(port, '0.0.0.0', () => {
//     console.log(`🚀 Blog Service is running on port ${port}`);
//   });

//   app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
//   // await app.listen();
// }
// bootstrap();