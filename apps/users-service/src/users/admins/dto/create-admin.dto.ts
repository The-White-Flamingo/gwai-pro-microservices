import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateAdminDto {
  @IsOptional()
  @IsUrl()
  profilePhoto?: string;

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
