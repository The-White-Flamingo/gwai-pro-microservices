import {
  CreateCommentDto,
  CreatePostDto,
  FindPostQueryDto,
  FollowUserDto,
  ReportPostDto,
  UpdatePostDto,
} from '@app/posts';
import { ActiveUserData } from '@app/iam';
import { POSTS_SERVICE, PaginationQueryDto } from '@app/shared';
import {
  BadRequestException,
  ForbiddenException,
  GatewayTimeoutException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { access } from 'fs/promises';
import { lastValueFrom, timeout, TimeoutError } from 'rxjs';
import { join, resolve } from 'path';
import sharp from 'sharp';

@Injectable()
export class PostsService {
  private static readonly RMQ_TIMEOUT_MS = 15000;

  constructor(@Inject(POSTS_SERVICE) private readonly client: ClientProxy) {}

  private async sendWithTimeout<T>(pattern: string, payload: unknown): Promise<T> {
    try {
      return await lastValueFrom(
        this.client.send<T>(pattern, payload).pipe(timeout(PostsService.RMQ_TIMEOUT_MS)),
      );
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw new GatewayTimeoutException(
          `Request to posts-service timed out for pattern ${pattern}`,
        );
      }

      throw error;
    }
  }

  async create(createPostDto: CreatePostDto) {
    try {
      return await this.sendWithTimeout('posts.create', createPostDto);
    } catch (error) {
      this.throwGatewayError(error, 'Failed to create post');
    }
  }

  async findAll(
    paginationQueryDto: PaginationQueryDto,
    findPostQueryDto: FindPostQueryDto,
    activeUser: ActiveUserData,
  ) {
    try {
      return await this.sendWithTimeout('posts.findAll', {
        paginationQueryDto,
        findPostQueryDto,
        activeUser,
      });
    } catch (error) {
      this.throwGatewayError(error, 'Failed to fetch general feed');
    }
  }

  async findFollowingFeed(
    paginationQueryDto: PaginationQueryDto,
    activeUser: ActiveUserData,
  ) {
    try {
      return await this.sendWithTimeout('posts.findFollowingFeed', {
        paginationQueryDto,
        activeUser,
      });
    } catch (error) {
      this.throwGatewayError(error, 'Failed to fetch following feed');
    }
  }

  async findOne(id: string, activeUser: ActiveUserData) {
    try {
      return await this.sendWithTimeout('posts.findOne', { id, activeUser });
    } catch (error) {
      this.throwGatewayError(error, 'Failed to fetch post');
    }
  }

  async update(updatePostDto: UpdatePostDto) {
    try {
      return await this.sendWithTimeout('posts.update', updatePostDto);
    } catch (error) {
      this.throwGatewayError(error, 'Failed to update post');
    }
  }

  async remove(id: string, activeUser: ActiveUserData) {
    try {
      return await this.sendWithTimeout('posts.remove', { id, activeUser });
    } catch (error) {
      this.throwGatewayError(error, 'Failed to delete post');
    }
  }

  async toggleLike(postId: string, activeUser: ActiveUserData) {
    try {
      return await this.sendWithTimeout('posts.toggleLike', {
        postId,
        userId: activeUser.sub,
      });
    } catch (error) {
      this.throwGatewayError(error, 'Failed to toggle post like');
    }
  }

  async addComment(postId: string, dto: Omit<CreateCommentDto, 'postId' | 'userId'>, activeUser: ActiveUserData) {
    try {
      return await this.sendWithTimeout('posts.addComment', {
        ...dto,
        postId,
        userId: activeUser.sub,
      });
    } catch (error) {
      this.throwGatewayError(error, 'Failed to add comment');
    }
  }

  async reportPost(postId: string, dto: Omit<ReportPostDto, 'postId' | 'userId'>, activeUser: ActiveUserData) {
    try {
      return await this.sendWithTimeout('posts.report', {
        ...dto,
        postId,
        userId: activeUser.sub,
      });
    } catch (error) {
      this.throwGatewayError(error, 'Failed to report post');
    }
  }

  async followUser(followingId: string, activeUser: ActiveUserData) {
    const payload: FollowUserDto = {
      followerId: activeUser.sub,
      followingId,
    };

    try {
      return await this.sendWithTimeout('posts.followUser', payload);
    } catch (error) {
      this.throwGatewayError(error, 'Failed to follow user');
    }
  }

  async unfollowUser(followingId: string, activeUser: ActiveUserData) {
    const payload: FollowUserDto = {
      followerId: activeUser.sub,
      followingId,
    };

    try {
      return await this.sendWithTimeout('posts.unfollowUser', payload);
    } catch (error) {
      this.throwGatewayError(error, 'Failed to unfollow user');
    }
  }

  async downloadPostMedia(postId: string, activeUser: ActiveUserData) {
    const postResponse = (await this.findOne(postId, activeUser)) as {
      data?: { mediaUrl?: string };
    };
    const mediaUrl = postResponse?.data?.mediaUrl as string | undefined;

    if (!mediaUrl) {
      throw new BadRequestException('This post does not have downloadable media');
    }

    const uploadsRoot = resolve(join(process.cwd(), 'uploads'));
    const absoluteFilePath = resolve(
      join(process.cwd(), mediaUrl.replace(/^\//, '')),
    );

    if (!absoluteFilePath.startsWith(uploadsRoot)) {
      throw new BadRequestException('Invalid media path');
    }

    await access(absoluteFilePath);

    const image = sharp(absoluteFilePath);
    const metadata = await image.metadata();
    const width = metadata.width ?? 1200;
    const height = metadata.height ?? 1200;
    const watermarkWidth = Math.max(Math.round(width * 0.26), 220);
    const watermarkHeight = Math.max(Math.round(height * 0.08), 80);

    const watermarkSvg = Buffer.from(`
      <svg width="${watermarkWidth}" height="${watermarkHeight}" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="${watermarkWidth}" height="${watermarkHeight}" rx="18" ry="18" fill="rgba(10,32,58,0.45)"/>
        <circle cx="38" cy="${Math.round(watermarkHeight / 2)}" r="18" fill="rgba(255,255,255,0.92)"/>
        <text x="68" y="${Math.round(watermarkHeight / 2) + 10}" font-size="28" font-family="Arial, Helvetica, sans-serif" font-weight="700" fill="white">GwaiPro</text>
      </svg>
    `);

    const buffer = await image
      .composite([
        {
          input: watermarkSvg,
          gravity: 'southeast',
        },
      ])
      .png()
      .toBuffer();

    return {
      fileName: `gwai-pro-post-${postId}.png`,
      contentType: 'image/png',
      buffer,
    };
  }

  private throwGatewayError(error: any, fallbackMessage: string): never {
    if (error instanceof GatewayTimeoutException) {
      throw error;
    }

    if (error instanceof NotFoundException) {
      throw new NotFoundException(this.getErrorMessage(error));
    }

    if (error instanceof ForbiddenException) {
      throw new ForbiddenException(this.getErrorMessage(error));
    }

    throw new BadRequestException(this.getErrorMessage(error) || fallbackMessage);
  }

  private getErrorMessage(error: any): string {
    return (
      error?.response?.message ??
      error?.message ??
      error?.error?.message ??
      (typeof error === 'string' ? error : JSON.stringify(error))
    );
  }
}
