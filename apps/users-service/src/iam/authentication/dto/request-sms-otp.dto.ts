import { IsString } from 'class-validator';

export class RequestSmsOtpDto {
  @IsString()
  phoneNumber: string;
}
