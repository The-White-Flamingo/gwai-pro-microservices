import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsString, Length } from 'class-validator';

export class VerifySignUpOtpDto {
  @ApiProperty()
  @IsString()
  identifier: string;

  @ApiProperty()
  @IsNumberString()
  @Length(6, 6)
  otp: string;
}
