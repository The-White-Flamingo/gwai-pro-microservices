import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ResendSignUpOtpDto {
  @ApiProperty({ example: 'jane@example.com' })
  @IsEmail()
  email: string;
}
