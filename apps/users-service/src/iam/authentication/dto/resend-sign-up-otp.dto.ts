import { IsString } from 'class-validator';

export class ResendSignUpOtpDto {
  @IsString()
  identifier: string;
}
