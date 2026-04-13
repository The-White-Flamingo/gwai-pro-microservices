// apps/api-gateway/src/users/admins/dto/change-password.dto.ts
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty() @IsNotEmpty() @IsString()
  currentPassword: string;

  @ApiProperty() @IsNotEmpty() @IsString() @MinLength(8)
  newPassword: string;

  @ApiProperty() @IsNotEmpty() @IsString()
  confirmPassword: string;
}