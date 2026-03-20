import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsStrongPassword, MinLength } from 'class-validator';

export class SignUpDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsStrongPassword()
  @MinLength(8)
  password: string;

  @ApiProperty({
    enum: ['Client', 'Musician', 'Studio', 'Admin'],
    example: 'Client',
  })
  @IsIn(['Client', 'Musician', 'Studio', 'Admin'])
  role: string;
}
