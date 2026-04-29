// apps/api-gateway/src/users/admins/dto/update-notifications.dto.ts
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateNotificationsDto {
  @ApiPropertyOptional() @IsOptional() @IsBoolean()
  inAppNotifications?: boolean;

  @ApiPropertyOptional() @IsOptional() @IsBoolean()
  emailNotifications?: boolean;
}