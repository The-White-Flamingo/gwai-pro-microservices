// apps/api-gateway/src/blog/dto/create-blog.dto.ts
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { BlogStatus } from '../enums/blog-status.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBlogDto {
  @ApiProperty({ example: 'Boost Your Productivity' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: '<p>Full rich-text HTML body...</p>' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  image?: string; // populated server-side after file upload, not validated from client

  @ApiPropertyOptional({ example: ['Motivation', 'Productivity'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ enum: BlogStatus, example: BlogStatus.Draft })
  @IsNotEmpty()
  @IsEnum(BlogStatus)
  status: BlogStatus;

  @ApiProperty({ example: 'Christell Tawiah'})
  @IsNotEmpty()
  @IsString()
  authorName: string;

  // Injected server-side from jwt - no validation decorators
  authorId?: string;
  authorRole?: string;

}