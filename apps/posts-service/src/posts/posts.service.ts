import { CreatePostDto, UpdatePostDto } from '@app/posts';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private readonly postsRepository: Repository<Post>,
  ) {}

  async create(createPostDto: CreatePostDto) {
    try {
      const post = this.postsRepository.create(createPostDto);

      await this.postsRepository.save(post);

      return {
        status: true,
        message: 'Post created successfully',
        post,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll() {
    try {
      const posts = await this.postsRepository.find({
        relations: ['comments'],
      });

      return {
        status: true,
        message: 'Posts retrieved successfully',
        data: posts,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string) {
    try {
      const post = await this.postsRepository.findOne({
        where: { id },
        relations: ['comments'],
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      return {
        status: true,
        message: 'Post retrieved successfully',
        data: post,
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  async update(updatePostDto: UpdatePostDto) {
   try {
    const post = await this.postsRepository.findOneBy({ id: updatePostDto.id });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    await this.postsRepository.update(updatePostDto.id, updatePostDto);

    return {
      status: true,
      message: 'Post updated successfully',
      data: post,
    }
   } catch (error) {
    if (error instanceof NotFoundException) {
      throw new NotFoundException(error.message);
    }
    throw new BadRequestException(error.message);
   }
  }

  async remove(id: string) {
    try {
      const post = await this.postsRepository.findOneBy({ id });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      await this.postsRepository.delete({ id });

      return {
        status: true,
        message: 'Post deleted successfully',
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }
}
