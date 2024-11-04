import { Inject, Injectable, OnApplicationBootstrap, OnApplicationShutdown } from "@nestjs/common";
import { Redis } from "ioredis";
import { InvalidateRefreshTokenError } from "./errors/invalidate-refresh-token.error";

@Injectable()
export class RefreshTokenIdsStorage {
    constructor(
        @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    ) { }

    async insert(userId: string, tokenId: string): Promise<void> {
        await this.redisClient.set(this.getKey(userId), tokenId);
    }

    async validate(userId: string, tokenId: string): Promise<boolean> {
        const storedId = await this.redisClient.get(this.getKey(userId));
        if (storedId !== tokenId) {
            throw new InvalidateRefreshTokenError();
        }
        return storedId === tokenId;
    }

    async invalidate(userId: string): Promise<void> {
        await this.redisClient.del(this.getKey(userId));
    }

    private getKey(userId: string): string {
        return `user-${userId}`;
    }
}
