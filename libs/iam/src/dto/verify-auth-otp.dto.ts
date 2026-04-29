import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsString, Length } from 'class-validator';

export class VerifyAuthOtpDto {
  @ApiProperty({
    example: '+233201234567',
    description: 'Email, username, or phone number used to request the OTP.',
  })
  @IsString()
  identifier: string;

  @ApiProperty({
    example: '123456',
  })
  @IsNumberString()
  @Length(6, 6)
  otp: string;
}
