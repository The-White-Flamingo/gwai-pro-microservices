import { IsNotEmpty } from 'class-validator';

export class AppleTokenDto {
  @IsNotEmpty()
  token: string;
}
