// apps/blog-service/src/blog/dto/update-blog.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateBlogDto } from './create-blog.dto';

export class UpdateBlogDto extends PartialType(CreateBlogDto) {
  // Injected server-side on every update
  lastEditedBy?: string;
}
