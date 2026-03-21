// apps/blog-service/src/blog/blog.controller.ts
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { PaginateBlogDto } from './dto/paginate-blog.dto';

@Controller()
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @MessagePattern('blog.create')
  create(@Payload() createBlogDto: CreateBlogDto) {
    return this.blogService.create(createBlogDto);
  }

  @MessagePattern('blog.findAll')
  findAll(@Payload() paginateBlogDto: PaginateBlogDto) {
    return this.blogService.findAll(paginateBlogDto);
  }

  @MessagePattern('blog.findOne')
  findOne(@Payload() payload: { id: string }) {
    return this.blogService.findOne(payload.id);
  }

  @MessagePattern('blog.update')
  update(@Payload() payload: { id: string; updateBlogDto: UpdateBlogDto }) {
    return this.blogService.update(payload.id, payload.updateBlogDto);
  }

  @MessagePattern('blog.remove')
  remove(@Payload() payload: { id: string }) {
    return this.blogService.remove(payload.id);
  }
}