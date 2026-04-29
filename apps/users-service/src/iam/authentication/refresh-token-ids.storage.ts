import {
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Redis } from 'ioredis';
import { InvalidateRefreshTokenError } from './errors/invalidate-refresh-token.error';

@Injectable()
export class RefreshTokenIdsStorage {
  private static readonly REDIS_OPERATION_TIMEOUT_MS = 3000;

  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  async insert(userId: string, tokenId: string): Promise<void> {
    await this.withTimeout(
      this.redisClient.set(this.getKey(userId), tokenId),
      'Unable to persist refresh token',
    );
  }

  async validate(userId: string, tokenId: string): Promise<boolean> {
    const storedId = await this.withTimeout(
      this.redisClient.get(this.getKey(userId)),
      'Unable to validate refresh token',
    );
    if (storedId !== tokenId) {
      throw new InvalidateRefreshTokenError();
    }
    return storedId === tokenId;
  }

  async invalidate(userId: string): Promise<void> {
    await this.withTimeout(
      this.redisClient.del(this.getKey(userId)),
      'Unable to invalidate refresh token',
    );
  }

  private getKey(userId: string): string {
    return `user-${userId}`;
  }

  private async withTimeout<T>(
    operation: Promise<T>,
    message: string,
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new ServiceUnavailableException(message));
      }, RefreshTokenIdsStorage.REDIS_OPERATION_TIMEOUT_MS);
    });

    return Promise.race([operation, timeoutPromise]);
  }
}
