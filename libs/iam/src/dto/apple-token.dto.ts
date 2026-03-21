import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AppleTokenDto {
  @ApiProperty()
  @IsNotEmpty()
  token: string;
}
