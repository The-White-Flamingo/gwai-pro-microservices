import { IsOptional, IsString, IsUUID } from 'class-validator';

export class FindPostQueryDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  caption?: string;
}