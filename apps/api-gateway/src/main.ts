// import { NestFactory } from '@nestjs/core';
// import { ApiGatewayModule } from './app.module';
// import { ValidationPipe } from '@nestjs/common';
// import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// // import { Transport } from '@nestjs/microservices';

// async function bootstrap() {
//   const app = await NestFactory.create(ApiGatewayModule);

//   app.enableCors();

//   app.useGlobalPipes(new ValidationPipe());

//   const options = new DocumentBuilder()
//     .setTitle('GwaiPro API Gateway')
//     .setDescription('GwaiPro API Gateway built with NestJS')
//     .setVersion('1.0')
//     .addBearerAuth()
//     .build();

//   const document = SwaggerModule.createDocument(app, options);
//   SwaggerModule.setup('api', app, document);

//   // added changes for microservices
//   // app.connectMicroservice({
//   //   transport: Transport.RMQ, // Transport.RMQ
//   //   options: {
//   //     urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672'],
//   //     queue: 'api-gateway',
//   //   }});

//   const port = process.env.PORT || 3000;
//   // await app.startAllMicroservices(); 
//   await app.listen(port, '0.0.0.0', () => {
//     console.log(`API Gateway is running on http://localhost:${port}`);
//   });
// }
// bootstrap();

import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('GwaiPro API Gateway')
    .setDescription('GwaiPro API Gateway built with NestJS')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5675?frameMax=0';

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [
        rabbitmqUrl
        // 'amqp://guest:guest@localhost:5675?frameMax=0'
      ],
      queue: 'api-gateway',
      queueOptions:{
        durable: true
      }
    },
  });

  app.startAllMicroservices().catch(err => {
    console.error('Failed to start microservices', err);
    // process.exit(1);
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 API Gateway running at http://localhost:${port}`);
}
bootstrap();