import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSmsDto {
  @IsString()
  to: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  @MaxLength(11)
  senderId?: string;

  @IsOptional()
  @IsIn(['otp', 'transactional'])
  purpose?: 'otp' | 'transactional';
}
