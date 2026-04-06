import { BLOG_SERVICE } from '@app/shared';
import {
  BadRequestException,
  GatewayTimeoutException,
  HttpException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom, TimeoutError, timeout } from 'rxjs';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { PaginateBlogDto } from './dto/paginate-blog.dto';

const BLOG_RPC_TIMEOUT_MS = 10000;

@Injectable()
export class BlogService {
  constructor(@Inject(BLOG_SERVICE) private readonly client: ClientProxy) {}

  async create(createBlogDto: CreateBlogDto) {
    return this.send('blog.create', createBlogDto);
  }

  async findAll(paginateBlogDto: PaginateBlogDto) {
    return this.send('blog.findAll', paginateBlogDto);
  }

  async findAllAdmin(paginateBlogDto: PaginateBlogDto) {
    return this.send('blog.findAllAdmin', paginateBlogDto);
  }

  async findOne(id: string) {
    return this.send('blog.findOne', { id });
  }

  async update(id: string, updateBlogDto: UpdateBlogDto) {
    return this.send('blog.update', { id, updateBlogDto });
  }

  async remove(id: string) {
    return this.send('blog.remove', { id });
  }

  async publish(id: string, lastEditedBy: string) {
    return this.send('blog.publish', { id, lastEditedBy });
  }

  async unpublish(id: string, lastEditedBy: string) {
    return this.send('blog.unpublish', { id, lastEditedBy });
  }

  private async send<TResult, TPayload>(pattern: string, payload: TPayload) {
    try {
      return await lastValueFrom(
        this.client.send<TResult, TPayload>(pattern, payload).pipe(
          timeout(BLOG_RPC_TIMEOUT_MS),
        ),
      );
    } catch (error) {
      throw this.mapError(error);
    }
  }

  private mapError(error: unknown) {
    if (error instanceof TimeoutError) {
      return new GatewayTimeoutException(
        `Blog service request timed out after ${BLOG_RPC_TIMEOUT_MS}ms`,
      );
    }

    if (error instanceof HttpException) {
      return error;
    }

    if (this.isHttpLikeError(error)) {
      return new HttpException(error.message, error.statusCode);
    }

    const message =
      error instanceof Error ? error.message : 'Blog service request failed';

    return new BadRequestException(message);
  }

  private isHttpLikeError(
    error: unknown,
  ): error is { statusCode: number; message: string | string[] } {
    return (
      typeof error === 'object' &&
      error !== null &&
      typeof (error as { statusCode?: unknown }).statusCode === 'number' &&
      'message' in error
    );
  }
}
