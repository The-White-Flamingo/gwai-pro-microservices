import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ResendSignUpOtpDto {
  @ApiProperty({
    example: '+233201234567',
    description: 'Email or phone number used for the original OTP request.',
  })
  @IsString()
  identifier: string;
}
