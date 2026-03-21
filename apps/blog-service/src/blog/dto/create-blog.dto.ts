// apps/blog-service/src/blog/dto/create-blog.dto.ts
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { BlogStatus } from '../entities/blog.entity';

export class CreateBlogDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  image?: string; // populated by the service after file upload, not sent by client

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsNotEmpty()
  @IsEnum(BlogStatus)
  status: BlogStatus;

  @IsNotEmpty()
  @IsString()
  authorName: string; // from the form

  // Injected server-side from JWT — never from the client body
  authorId: string;
  authorRole: string;
}