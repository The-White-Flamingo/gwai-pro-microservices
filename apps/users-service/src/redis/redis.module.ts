import { Module, Global, DynamicModule, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';

export interface RedisModuleOptions {
  host: string;
  port: number;
  username?: string;
  password?: string;
  useTLS?: boolean;
}

@Global()
@Module({})
export class RedisModule implements OnModuleDestroy {
  private redisClient: Redis;

  static forRoot(options: RedisModuleOptions): DynamicModule {
    const redisClientProvider = {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        const redisClient = new Redis({
          host: options.host,
          port: options.port,
          username: options.username ? options.username: undefined,
          password: options.password ? options.password : undefined,
          tls: options.useTLS ? {} : undefined
        });
        redisClient.on('error', (err) => {
          console.error('Redis Client Error', err);
        });
        return redisClient;
      },
    };

    return {
      module: RedisModule,
      providers: [redisClientProvider],
      exports: [redisClientProvider],
    };
  }

  constructor() {
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST,
      port: +process.env.REDIS_PORT,
    });
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
  }
}
