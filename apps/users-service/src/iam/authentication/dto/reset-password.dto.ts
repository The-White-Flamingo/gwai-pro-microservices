import {
  IsEmail,
  IsNumberString,
  IsStrongPassword,
  Length,
  MinLength,
} from 'class-validator';

export class ResetPasswordDto {
  @IsEmail()
  email: string;

  @IsNumberString()
  @Length(6, 6)
  otp: string;

  @IsStrongPassword()
  @MinLength(8)
  newPassword: string;
}
