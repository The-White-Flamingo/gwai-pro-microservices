import { IsNumberString, IsString, Length } from 'class-validator';

export class VerifySignUpOtpDto {
  @IsString()
  identifier: string;

  @IsNumberString()
  @Length(6, 6)
  otp: string;
}
