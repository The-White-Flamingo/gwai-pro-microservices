// apps/api-gateway/src/blog/dto/update-blog.dto.ts
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { BlogStatus } from '../enums/blog-status.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBlogDto {
  @ApiPropertyOptional({ example: 'Boost Your Productivity' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: '<p>Updated rich-text HTML body...</p>' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  image?: string; // populated server-side after file upload

  @ApiPropertyOptional({ example: ['Motivation', 'Productivity'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ enum: BlogStatus, example: BlogStatus.Published })
  @IsOptional()
  @IsEnum(BlogStatus)
  status?: BlogStatus;

  @ApiPropertyOptional({ example: 'Christell Tawiah' })
  @IsOptional()
  @IsString()
  authorName?: string;

  // Injected server-side from JWT on every update — never from the client body
  lastEditedBy?: string;
}