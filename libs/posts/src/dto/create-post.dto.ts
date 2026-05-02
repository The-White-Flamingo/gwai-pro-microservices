import { Role } from '@app/users';
import { IsArray, IsIn, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePostDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaUrls?: string[];

  @IsOptional()
  @IsIn(['IMAGE', 'VIDEO'])
  mediaKind?: 'IMAGE' | 'VIDEO';

  @IsOptional()
  @IsString()
  caption?: string;

  @IsUUID()
  userId: string;

  @IsEnum(Role)
  userRole: Role;
}
