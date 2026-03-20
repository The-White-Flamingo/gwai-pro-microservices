import { IsNotEmpty, IsUrl, IsUUID } from 'class-validator';

export class CreatePostDto {
  @IsUrl()
  @IsNotEmpty()
  mediaUrl: string;

  @IsNotEmpty()
  caption: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;
}