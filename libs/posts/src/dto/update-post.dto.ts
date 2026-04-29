import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @IsUUID()
  @IsNotEmpty()
  id: string;
}
