import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class ReportPostDto {
  @IsUUID()
  postId: string;

  @IsUUID()
  userId: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
