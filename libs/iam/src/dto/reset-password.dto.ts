import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumberString, IsStrongPassword, Length, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'jane@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsNumberString()
  @Length(6, 6)
  otp: string;

  @ApiProperty({ example: 'N3wStrongPass!23' })
  @IsStrongPassword()
  @MinLength(8)
  newPassword: string;
}
