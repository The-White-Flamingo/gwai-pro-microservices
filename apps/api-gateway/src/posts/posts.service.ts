import { CreatePostDto, UpdatePostDto } from '@app/posts';
import { POSTS_SERVICE } from '@app/shared';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { last, lastValueFrom } from 'rxjs';

@Injectable()
export class PostsService {
  constructor(@Inject(POSTS_SERVICE) private readonly client: ClientProxy) {}

  async create(createPostDto: CreatePostDto) {
    try {
      const post = lastValueFrom(
        this.client.send('posts.create', createPostDto),
      );

      return post;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll() {
    try {
      const posts = lastValueFrom(this.client.send('posts.findAll', {}));

      return posts;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string) {
    try {
      const post = lastValueFrom(this.client.send('posts.findOne', { id }));

      return post;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    try {
      const post = lastValueFrom(
        this.client.send('posts.update', { id, ...updatePostDto }),
      );

      return post;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      const post = lastValueFrom(this.client.send('posts.remove', { id }));

      return post;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }
}
