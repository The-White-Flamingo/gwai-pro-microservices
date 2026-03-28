// libs/iam/src/authentication/dto/admin-sign-in.dto.ts
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminSignInDto {
  @ApiProperty({ example: 'admin@gwaipro.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Admin@1234!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}

// import { IsEmail, IsStrongPassword, MinLength } from 'class-validator';
// import { ApiProperty } from '@nestjs/swagger';

// export class AdminSignInDto {
//   @ApiProperty({ example: 'developer@gwaipro.com' })
//   @IsEmail()
//   email: string;

//   @ApiProperty({ example: 'admin@gwaipro' })
//   @IsStrongPassword()
//   @MinLength(8)
//   password: string;
// }