import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class InviteStaffDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  role: string;
}
