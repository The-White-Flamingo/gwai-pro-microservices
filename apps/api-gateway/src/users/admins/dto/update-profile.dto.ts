// apps/api-gateway/src/users/admins/dto/update-profile.dto.ts
import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2)
  firstName?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2)
  lastName?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  country?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  postalAddress?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  contact?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  location?: string;
}