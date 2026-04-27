import { IsUUID } from 'class-validator';

export class FollowUserDto {
  @IsUUID()
  followerId: string;

  @IsUUID()
  followingId: string;
}
