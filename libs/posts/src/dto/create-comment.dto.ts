import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  body: string;

  @IsUUID()
  postId: string;

  @IsUUID()
  userId: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}
