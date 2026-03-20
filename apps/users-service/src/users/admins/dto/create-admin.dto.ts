import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAdminDto {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsNotEmpty()
  contact: string;

  @IsOptional()
  location: string;

  @IsOptional()
  role: string;
}
