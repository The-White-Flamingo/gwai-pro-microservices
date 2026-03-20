import { CreatePostDto, FindPostQueryDto, UpdatePostDto } from '@app/posts';
import { POSTS_SERVICE, PaginationQueryDto } from '@app/shared';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { ActiveUserData } from '@app/iam';

@Injectable()
export class PostsService {
  constructor(@Inject(POSTS_SERVICE) private readonly client: ClientProxy) {}

  async create(createPostDto: CreatePostDto) {
    try {
      return await lastValueFrom(this.client.send('posts.create', createPostDto));
    } catch (error: any) {
      throw new BadRequestException(error?.message ?? 'Failed to create post');
    }
  }

  async findAll(
    paginationQueryDto: PaginationQueryDto,
    findPostQueryDto: FindPostQueryDto,
    activeUser: ActiveUserData,
  ) {
    try {
      return await lastValueFrom(
        this.client.send('posts.findAll', {
          paginationQueryDto,
          findPostQueryDto,
          activeUser,
        }),
      );
    } catch (error: any) {
      throw new BadRequestException(error?.message ?? 'Failed to fetch posts');
    }
  }

  async findOne(id: string) {
    try {
      // IMPORTANT: send id as string, posts-service expects @Payload() id: string
      return await lastValueFrom(this.client.send('posts.findOne', id));
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(error?.message ?? 'Failed to fetch post');
    }
  }

  async update(updatePostDto: UpdatePostDto) {
    try {
      return await lastValueFrom(this.client.send('posts.update', updatePostDto));
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(error?.message ?? 'Failed to update post');
    }
  }

  async remove(id: string) {
    try {
      // IMPORTANT: send id as string
      return await lastValueFrom(this.client.send('posts.remove', id));
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(error?.message ?? 'Failed to delete post');
    }
  }
}