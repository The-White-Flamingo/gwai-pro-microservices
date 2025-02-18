<<<<<<< Updated upstream
import { IsInt, IsOptional, Min } from "class-validator";

export class PaginationQueryDto {
    @IsOptional()
=======
import { Optional } from "@nestjs/common";
import { IsInt, Min } from "class-validator";

export class PaginationQueryDto {
    @Optional()
>>>>>>> Stashed changes
    @IsInt()
    @Min(1)
    offset: number;

<<<<<<< Updated upstream
    @IsOptional()
=======
    @Optional()
>>>>>>> Stashed changes
    @IsInt()
    @Min(1)
    limit: number;
}