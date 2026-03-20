import { IsEmail, IsNumberString, Length } from 'class-validator';

export class VerifySignUpOtpDto {
  @IsEmail()
  email: string;

  @IsNumberString()
  @Length(6, 6)
  otp: string;
}
