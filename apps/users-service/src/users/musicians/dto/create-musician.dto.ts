import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMusicianDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  dateOfBirth: Date;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  rate: string;

  @IsArray()
  @IsString({ each: true })
  interests: string[];

  @IsArray()
  @IsString({ each: true })
  genres: string[];

  @IsOptional()
  @IsString()
  profilePicturePath?: string;
}
