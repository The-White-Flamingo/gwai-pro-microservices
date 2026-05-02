import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAdminDto {
  @IsOptional()
  @IsString()
  profilePhoto?: string;

  @IsOptional()
  @IsString()
  coverVideoPath?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  postalAddress?: string;
}
