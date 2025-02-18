import { IsInt, IsOptional, Min } from "class-validator";

export class PaginationQueryDto {
    @IsOptional()
    @IsInt()
    @Min(1)
    offset: number;


    @IsOptional()
    @IsInt()
    @Min(1)
    limit: number;
}