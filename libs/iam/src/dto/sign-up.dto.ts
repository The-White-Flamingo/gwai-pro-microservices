import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsStrongPassword, Min, MinLength } from "class-validator";

export class SignUpDto {
    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsStrongPassword()
    @MinLength(8)
    password: string;
}
