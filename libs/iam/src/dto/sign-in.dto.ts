import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SignInDto {
  @ApiProperty({
    description: 'Email, username, or phone number used to request the OTP.',
    example: '+233201234567',
  })
  @IsString()
  identifier: string;
}
