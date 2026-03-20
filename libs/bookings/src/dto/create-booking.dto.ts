import { IsDateString, IsNotEmpty, IsString, Matches, IsOptional } from 'class-validator';
import { BookingStatus } from '../enums/booking-status.enum';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  serviceType: string;

  @IsDateString()
  date: string; // send as ISO date string e.g. "2026-02-21"

  // HH:mm:ss (matches your entity column type 'time')
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, { message: 'startTime must be HH:mm:ss' })
  startTime: string;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, { message: 'endTime must be HH:mm:ss' })
  endTime: string;

  @IsOptional()
  status?: BookingStatus; // optional; entity defaults to Requested
}