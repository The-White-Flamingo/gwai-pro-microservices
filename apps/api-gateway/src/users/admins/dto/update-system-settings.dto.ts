import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSystemSettingsDto {
  @ApiPropertyOptional({ example: '1 hour' })
  @IsOptional() @IsString()
  minimumBookingNotice?: string;

  @ApiPropertyOptional({ example: '30 days' })
  @IsOptional() @IsString()
  maximumBookingWindow?: string;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional() @IsNumber() @Min(0) @Max(100)
  musicianCommissionRate?: number;

  @ApiPropertyOptional({ example: 15 })
  @IsOptional() @IsNumber() @Min(0) @Max(100)
  studioCommissionRate?: number;

  @ApiPropertyOptional({ example: '12 hours before session' })
  @IsOptional() @IsString()
  freeCancellationUntil?: string;

  @ApiPropertyOptional({ example: '50' })
  @IsOptional() @IsString()
  refundPercentageAfter?: string;

  @ApiPropertyOptional({ example: 'You may cancel your session...' })
  @IsOptional() @IsString()
  policyDescription?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional() @IsBoolean()
  bookingConfirmations?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional() @IsBoolean()
  bookingChanges?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional() @IsBoolean()
  payoutUpdates?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional() @IsBoolean()
  refundRequests?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional() @IsBoolean()
  paymentFailures?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional() @IsBoolean()
  adminNotesComments?: boolean;
}
