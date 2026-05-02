import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class InviteStaffDto {
  @ApiProperty({ example: 'Ama' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Boateng' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'ama.ops@gwaipro.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Ops Lead' })
  @IsNotEmpty()
  @IsString()
  role: string;
}
