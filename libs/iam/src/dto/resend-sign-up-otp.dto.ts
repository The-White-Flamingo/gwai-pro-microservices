import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ResendSignUpOtpDto {
  @ApiProperty({ example: 'jane@example.com' })
  @IsString()
  identifier: string;
}
