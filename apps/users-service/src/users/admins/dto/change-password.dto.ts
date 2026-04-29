// apps/users-service/src/users/admins/dto/change-password.dto.ts
import { IsNotEmpty, IsString, IsStrongPassword, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  currentPassword: string;

  @IsNotEmpty()
  @IsStrongPassword()
  @MinLength(8)
  newPassword: string;

  @IsNotEmpty()
  @IsString()
  confirmPassword: string;
}