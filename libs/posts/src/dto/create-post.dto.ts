import { Role } from '@app/users';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePostDto {
  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @IsOptional()
  @IsString()
  caption?: string;

  @IsUUID()
  userId: string;

  @IsEnum(Role)
  userRole: Role;
}
