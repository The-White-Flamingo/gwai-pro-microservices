// apps/api-gateway/src/users/admins/dto/invite-staff.dto.ts
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InviteStaffDto {
  @ApiProperty({ example: 'Ama' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Boateng' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'ama@gwaipro.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Ops Lead' })
  @IsNotEmpty()
  @IsString()
  role: string;
}