import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStudioDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  rate: string;

  @IsArray()
  @IsString({ each: true })
  services: string[];

  @IsArray()
  @IsString({ each: true })
  equipment: string[];

  @IsOptional()
  @IsString()
  profilePicturePath?: string;
}
