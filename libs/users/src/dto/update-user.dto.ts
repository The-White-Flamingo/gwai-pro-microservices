import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { Role } from '../enums/role.enum';

export class UpdateUserDto {
  @IsString()
  id: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
