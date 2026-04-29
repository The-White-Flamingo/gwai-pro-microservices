import { IsUUID } from 'class-validator';

export class ToggleLikeDto {
  @IsUUID()
  postId: string;

  @IsUUID()
  userId: string;
}
