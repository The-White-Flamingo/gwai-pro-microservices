import { IsNumberString, IsString, Length } from 'class-validator';

export class VerifyAuthOtpDto {
  @IsString()
  identifier: string;

  @IsNumberString()
  @Length(6, 6)
  otp: string;
}
