// apps/api-gateway/src/blog/blog.service.ts
import { BLOG_SERVICE } from '@app/shared';
import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Injectable()
export class BlogService {
  constructor(
    @Inject(BLOG_SERVICE) private readonly client: ClientProxy,
  ) {}

  async create(createBlogDto: CreateBlogDto) {
    try {
      return await lastValueFrom(this.client.send('blog.create', createBlogDto));
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll() {
    try {
      return await lastValueFrom(this.client.send('blog.findAll', {}));
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAllAdmin() {
    try {
      return await lastValueFrom(this.client.send('blog.findAllAdmin', {}));
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string) {
    try {
      return await lastValueFrom(this.client.send('blog.findOne', { id }));
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, updateBlogDto: UpdateBlogDto) {
    try {
      return await lastValueFrom(
        this.client.send('blog.update', { id, updateBlogDto }),
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      return await lastValueFrom(this.client.send('blog.remove', { id }));
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async publish(id: string) {
    try {
      return await lastValueFrom(this.client.send('blog.publish', { id }));
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async unpublish(id: string) {
    try {
      return await lastValueFrom(this.client.send('blog.unpublish', { id }));
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}