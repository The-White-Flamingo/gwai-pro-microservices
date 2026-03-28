import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class RequestAuthOtpDto {
  @ApiPropertyOptional({
    example: 'jane@example.com',
    description:
      'Required for first-time authentication. Returning users can also use it to request a login OTP.',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: 'jane_doe',
    description:
      'Used only for returning users. The OTP will still be sent to the email already linked to that username.',
  })
  @IsOptional()
  @IsString()
  username?: string;
}
