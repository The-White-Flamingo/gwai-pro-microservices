import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RequestSmsOtpDto {
  @ApiProperty({
    example: '+233201234567',
    description:
      'Phone number already saved on a completed user profile. OTP will be delivered by SMS.',
  })
  @IsString()
  phoneNumber: string;
}
