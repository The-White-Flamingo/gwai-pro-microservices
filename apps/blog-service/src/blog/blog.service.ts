import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog, BlogStatus } from './entities/blog.entity';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { PaginateBlogDto } from './dto/paginate-blog.dto';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
  ) {}

  async create(createBlogDto: CreateBlogDto) {
    try {
      const blog = this.blogRepository.create({
        ...createBlogDto,
        publishedAt:
          createBlogDto.status === BlogStatus.Published ? new Date() : null,
      });

      await this.blogRepository.save(blog);
      return this.formatSingle(blog);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(paginateBlogDto: PaginateBlogDto = {}) {
    const { page, limit, skip } = this.normalizePagination(paginateBlogDto);

    const [posts, totalCount] = await this.blogRepository.findAndCount({
      where: { status: BlogStatus.Published },
      order: { publishedAt: 'DESC', createdAt: 'DESC' },
      skip,
      take: limit,
      select: [
        'id',
        'title',
        'status',
        'image',
        'tags',
        'authorName',
        'publishedAt',
      ],
    });

    return {
      data: posts,
      totalCount,
      totalPages: Math.ceil(totalCount / limit) || 1,
      currentPage: page,
    };
  }

  async findAllAdmin(paginateBlogDto: PaginateBlogDto = {}) {
    const { page, limit, skip } = this.normalizePagination(paginateBlogDto);

    const [posts, totalCount] = await this.blogRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: posts.map((post) => this.formatSingle(post)),
      totalCount,
      totalPages: Math.ceil(totalCount / limit) || 1,
      currentPage: page,
    };
  }

  async findOne(id: string) {
    const blog = await this.blogRepository.findOneBy({ id });
    if (!blog) {
      return new NotFoundException('Blog post not found').getResponse();
    }
    return this.formatSingle(blog);
  }

  async update(id: string, updateBlogDto: UpdateBlogDto) {
    const blog = await this.blogRepository.findOneBy({ id });
    if (!blog) {
      return new NotFoundException('Blog post not found').getResponse();
    }

    const isBeingPublished =
      updateBlogDto.status === BlogStatus.Published &&
      blog.status !== BlogStatus.Published;
    const isBeingUnpublished =
      updateBlogDto.status === BlogStatus.Draft &&
      blog.status === BlogStatus.Published;

    Object.assign(blog, updateBlogDto);

    if (isBeingPublished) {
      blog.publishedAt = new Date();
    }

    if (isBeingUnpublished) {
      blog.publishedAt = null;
    }

    await this.blogRepository.save(blog);
    return this.formatSingle(blog);
  }

  async remove(id: string) {
    const blog = await this.blogRepository.findOneBy({ id });
    if (!blog) {
      return new NotFoundException('Blog post not found').getResponse();
    }
    await this.blogRepository.remove(blog);
    return { success: true, message: 'Blog post deleted successfully.' };
  }

  async publish(id: string, lastEditedBy?: string) {
    const blog = await this.blogRepository.findOneBy({ id });
    if (!blog) {
      return new NotFoundException('Blog post not found').getResponse();
    }

    blog.status = BlogStatus.Published;
    blog.publishedAt = blog.publishedAt ?? new Date();
    blog.lastEditedBy = lastEditedBy ?? blog.lastEditedBy;

    await this.blogRepository.save(blog);
    return this.formatSingle(blog);
  }

  async unpublish(id: string, lastEditedBy?: string) {
    const blog = await this.blogRepository.findOneBy({ id });
    if (!blog) {
      return new NotFoundException('Blog post not found').getResponse();
    }

    blog.status = BlogStatus.Draft;
    blog.publishedAt = null;
    blog.lastEditedBy = lastEditedBy ?? blog.lastEditedBy;

    await this.blogRepository.save(blog);
    return this.formatSingle(blog);
  }

  private normalizePagination(paginateBlogDto: PaginateBlogDto) {
    const page = paginateBlogDto.page ?? 1;
    const limit = paginateBlogDto.limit ?? 9;
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }

  private formatSingle(blog: Blog) {
    return {
      id: blog.id,
      title: blog.title,
      status: blog.status,
      image: blog.image,
      tags: blog.tags,
      content: blog.content,
      authorName: blog.authorName,
      authorRole: blog.authorRole,
      lastEditedBy: blog.lastEditedBy,
      publishedAt: blog.publishedAt,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
    };
  }
}
