import { IsEmail, IsNotEmpty, IsStrongPassword, MinLength } from 'class-validator';
import { Role } from '../../../users/enums/role.enum';

export class SignUpDto {
  @IsEmail()
  email: string;

  @IsStrongPassword()
  @MinLength(8)
  password: string;

  @IsNotEmpty()
  role: Role;
}
