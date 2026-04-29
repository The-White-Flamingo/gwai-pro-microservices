// apps/users-service/src/users/admins/dto/update-notifications.dto.ts
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationsDto {
  @IsOptional()
  @IsBoolean()
  inAppNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;
}