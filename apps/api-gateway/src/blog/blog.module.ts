// apps/api-gateway/src/blog/blog.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BLOG_SERVICE } from '@app/shared';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: BLOG_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL],
          queue: 'blog-service',
          queueOptions: { durable: true },
          socketOptions: {
            noDelay: true,
            rejectUnauthorized: false,
            secureProtocol: 'TLSv1_2_method',
          },
        },
      },
    ]),
  ],
  controllers: [BlogController],
  providers: [BlogService],
})
export class BlogModule {}