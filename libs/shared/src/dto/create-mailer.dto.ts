import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateMailerDto {
  @IsEmail()
  to: string | string[];

  @IsNotEmpty()
  subject: string;

  @IsNotEmpty()
  text: string;

  @IsOptional()
  html?: string;

  @IsOptional()
  bcc?: string | string[];
}
