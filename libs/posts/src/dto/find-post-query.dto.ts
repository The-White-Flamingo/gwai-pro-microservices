import { IsOptional } from "class-validator";

export class FindPostQueryDto {
    @IsOptional()
    username: string;

    @IsOptional()
    caption: string;
}