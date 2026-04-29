import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export class FindPostQueryDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsIn(['TEXT', 'MEDIA', 'MEDIA_WITH_CAPTION'])
  type?: 'TEXT' | 'MEDIA' | 'MEDIA_WITH_CAPTION';
}
