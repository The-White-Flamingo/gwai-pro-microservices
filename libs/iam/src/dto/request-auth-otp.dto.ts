import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class RequestAuthOtpDto {
  @ApiPropertyOptional({
    example: 'jane@example.com',
    description:
      'Required for first-time authentication. For returning users, either email or username can be provided.',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: 'jane_doe',
    description:
      'Required for first-time authentication. Returning users can use this instead of email.',
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    example: '+233201234567',
    description: 'Required only when creating a new user through OTP auth.',
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
