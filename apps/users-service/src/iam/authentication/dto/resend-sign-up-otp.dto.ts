import { IsEmail } from 'class-validator';

export class ResendSignUpOtpDto {
  @IsEmail()
  email: string;
}
