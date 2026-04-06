import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class AdminSignUpDto {
  @ApiProperty({
    example: 'admin@gwaipro.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'admingwai@123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;
}
