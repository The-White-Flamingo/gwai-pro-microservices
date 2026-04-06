import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { CreateBlogDto } from './create-blog.dto';

export class UpdateBlogDto extends PartialType(CreateBlogDto) {
  // Injected server-side on every update.
  @IsOptional()
  @IsString()
  lastEditedBy?: string;
}
