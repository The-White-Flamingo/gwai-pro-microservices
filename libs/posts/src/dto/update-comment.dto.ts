import { PartialType } from '@nestjs/mapped-types';
import { CreateCommentDto } from './create-comment.dto';
import { IsUUID } from 'class-validator';

export class UpdateCommentDto extends PartialType(CreateCommentDto) {
  @IsUUID()
  id: string;
}
