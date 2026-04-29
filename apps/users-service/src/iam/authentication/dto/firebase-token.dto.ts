import { IsString } from 'class-validator';

export class FirebaseTokenDto {
  @IsString()
  token: string;
}
