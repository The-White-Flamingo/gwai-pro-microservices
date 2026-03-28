import { IsEmail, IsOptional, IsString } from 'class-validator';

export class RequestAuthOtpDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
