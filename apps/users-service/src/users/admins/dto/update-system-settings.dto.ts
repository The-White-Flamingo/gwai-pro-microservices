// apps/users-service/src/users/admins/dto/update-system-settings.dto.ts
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateSystemSettingsDto {
  // Booking Configuration
  @IsOptional()
  @IsString()
  minimumBookingNotice?: string;

  @IsOptional()
  @IsString()
  maximumBookingWindow?: string;

  // Commission Management
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  musicianCommissionRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  studioCommissionRate?: number;

  // Policy Configuration
  @IsOptional()
  @IsString()
  freeCancellationUntil?: string;

  @IsOptional()
  @IsString()
  refundPercentageAfter?: string;

  @IsOptional()
  @IsString()
  policyDescription?: string;

  // Email Notifications
  @IsOptional()
  @IsBoolean()
  bookingConfirmations?: boolean;

  @IsOptional()
  @IsBoolean()
  bookingChanges?: boolean;

  @IsOptional()
  @IsBoolean()
  payoutUpdates?: boolean;

  @IsOptional()
  @IsBoolean()
  refundRequests?: boolean;

  @IsOptional()
  @IsBoolean()
  paymentFailures?: boolean;

  @IsOptional()
  @IsBoolean()
  adminNotesComments?: boolean;
}
