import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class GoogleTokenDto {
    @ApiProperty()
    @IsNotEmpty()
    token: string;
}